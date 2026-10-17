import crypto from "node:crypto";
import { comparePassword, hashPassword, signToken } from "./auth.js";
import { generateOtp } from "./helpers/otp.js";
import { sendOtpEmail, sendOtpWhatsApp } from "./messaging.js";
import { emailConfigured, whatsappConfigured } from "./config/env.js";
import {
  AttendanceModel,
  LiveClassModel,
  NoteModel,
  NoticeModel,
  OTPModel,
  PaperModel,
  QuizModel,
  UserModel,
  VideoModel
} from "./models/index.js";
import { seedState } from "./data.js";
import type { Grade, Stream } from "./types.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Mongoose lean doc to a plain object with `id` string field */
function toPlain(doc: any) {
  if (!doc) return null;
  const plain = { ...doc };
  plain.id = doc._id?.toString() ?? doc.id;
  delete plain._id;
  delete plain.__v;
  return plain;
}

/** Canonicalise a phone number so the same mobile entered as +91 90000 00000,
 *  090000-00000 or 9000000000 all map to one identity for uniqueness. Indian
 *  mobiles collapse to the 10-digit national number; other numbers keep digits only. */
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);        // international prefix 00 -> +
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2); // drop +91 country code
  while (d.length > 10 && d.startsWith("0")) d = d.slice(1); // drop trunk prefix 0
  return d;
}

function buildContentQuery(filters: Partial<{ grade: Grade; stream: Stream; subject: string; search: string }>) {
  const query: any = {};
  if (filters.grade)   query.grade = filters.grade;
  if (filters.stream)  query.stream = filters.stream;
  if (filters.subject) query.subject = new RegExp(filters.subject, "i");
  if (filters.search) {
    query.$or = [
      { title:      new RegExp(filters.search, "i") },
      { subject:    new RegExp(filters.search, "i") },
      { instructor: new RegExp(filters.search, "i") },
      { topic:      new RegExp(filters.search, "i") }
    ];
  }
  return query;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardSummary() {
  const [users, notes, papers, videos, quizzes, liveClasses, notices] = await Promise.all([
    UserModel.find().lean(),
    NoteModel.countDocuments(),
    PaperModel.countDocuments(),
    VideoModel.countDocuments(),
    QuizModel.countDocuments(),
    LiveClassModel.countDocuments(),
    NoticeModel.countDocuments()
  ]);

  const stats = [
    { label: "Users",        value: users.length },
    { label: "Students",     value: users.filter((u: any) => u.role === "student").length },
    { label: "Teachers",     value: users.filter((u: any) => u.role === "teacher").length },
    { label: "Admins",       value: users.filter((u: any) => u.role === "admin").length },
    { label: "Notes",        value: notes },
    { label: "Papers",       value: papers },
    { label: "Videos",       value: videos },
    { label: "Quizzes",      value: quizzes },
    { label: "Live Classes", value: liveClasses },
    { label: "Notices",      value: notices }
  ];

  const distributions = {
    medical:    users.filter((u: any) => u.stream === "Medical").length,
    nonMedical: users.filter((u: any) => u.stream === "Non-Medical").length,
    commerce:   users.filter((u: any) => u.stream === "Commerce").length,
    arts:       users.filter((u: any) => u.stream === "Arts").length,
    general:    users.filter((u: any) => u.stream === "General").length
  };

  return {
    summary: { stats, distributions },
    users: users.map((u: any) => ({
      _id:       u._id.toString(),
      username:  u.username,
      email:     u.email,
      role:      u.role,
      grade:     u.grade,
      stream:    u.stream,
      createdAt: u.createdAt
    }))
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export function publicUser(user: any) {
  return {
    id:        user._id?.toString() ?? user.id,
    username:  user.username,
    email:     user.email,
    role:      user.role,
    grade:     user.grade,
    stream:    user.stream,
    createdAt: user.createdAt
  };
}

const OTP_TTL_MS = 10 * 60 * 1000;

/** Issue a signup OTP to an email (and WhatsApp if configured + phone given). */
export async function sendSignupOtp(rawEmail: string, phone?: string) {
  const email = rawEmail.toLowerCase();

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) return { status: 409, body: { message: "An account with this email already exists" } };

  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length >= 7) {
      const phoneTaken = await UserModel.findOne({ phone: normalizedPhone }).lean();
      if (phoneTaken) return { status: 409, body: { message: "This phone number is already registered with another account" } };
    }
  }

  const code = generateOtp();
  await OTPModel.deleteMany({ email });
  await OTPModel.create({ email, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) });

  const channels: string[] = [];
  const failures: string[] = [];

  if (emailConfigured) {
    const r = await sendOtpEmail(email, code);
    if (r.ok) channels.push("email");
    else failures.push(r.error ?? "email failed");
  }

  if (phone && whatsappConfigured) {
    const r = await sendOtpWhatsApp(phone, code);
    if (r.ok) channels.push("whatsapp");
    else failures.push(r.error ?? "whatsapp failed");
  }

  if (!channels.length) {
    return {
      status: 502,
      body: { message: failures[0] ?? "No delivery channel is configured. Set SMTP credentials in the server .env." }
    };
  }

  return {
    status: 200,
    body: {
      message: `Verification code sent via ${channels.join(" and ")}.`,
      channels,
      whatsappUsed: channels.includes("whatsapp")
    }
  };
}

async function consumeSignupOtp(email: string, code: string): Promise<boolean> {
  const otp = await OTPModel.findOne({ email: email.toLowerCase() }).lean();
  if (!otp) return false;
  if ((otp as any).expiresAt.getTime() < Date.now()) {
    await OTPModel.deleteOne({ email: email.toLowerCase() });
    return false;
  }
  const expected = String(otp.code);
  const provided = String(code);
  if (expected.length !== provided.length) return false;
  const match = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  if (!match) return false;
  await OTPModel.deleteOne({ email: email.toLowerCase() });
  return true;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  confirmPassword?: string;
  grade: Grade;
  stream: Stream;
  role?: "superAdmin" | "admin" | "teacher" | "student";
  username?: string;
  otp?: string;
  phone?: string;
}) {
  const requestedRole = payload.role ?? "student";
  if (!["superAdmin", "admin", "teacher", "student"].includes(requestedRole)) {
    return { status: 400, body: { message: "Invalid role requested" } };
  }

  const existing = await UserModel.findOne({ email: payload.email.toLowerCase() }).lean();
  if (existing) return { status: 409, body: { message: "User already exists" } };

  // A phone number is required for student signups and may belong to only one account.
  const normalizedPhone = payload.phone ? normalizePhone(payload.phone) : "";
  if (requestedRole === "student") {
    if (normalizedPhone.length < 7) {
      return { status: 400, body: { message: "A valid phone number is required to register." } };
    }
    const phoneTaken = await UserModel.findOne({ phone: normalizedPhone }).lean();
    if (phoneTaken) return { status: 409, body: { message: "This phone number is already registered with another account" } };
  }

  // Email OTP is required for open student signups. Privileged roles (admin/teacher/
  // superAdmin) are already gated by an existing administrator's authorization in the
  // controller, so they don't require the email OTP.
  if (requestedRole === "student") {
    if (!payload.otp || !(await consumeSignupOtp(payload.email, payload.otp))) {
      return { status: 400, body: { message: "Valid email verification code is required. Please request an OTP and enter it." } };
    }
  }

  const user = await UserModel.create({
    username:     payload.username || payload.email.split("@")[0],
    email:        payload.email.toLowerCase(),
    phone:        normalizedPhone || undefined,
    passwordHash: await hashPassword(payload.password),
    role:         requestedRole,
    grade:        payload.grade,
    stream:       payload.stream
  });

  return {
    status: 201,
    body: {
      message: "Registration successful",
      token:   signToken(user as any),
      user:    publicUser(user)
    }
  };
}

export async function loginUser(payload: { email: string; password: string }) {
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() }).lean();
  if (!user) return { status: 401, body: { message: "Invalid credentials" } };

  const ok = await comparePassword(payload.password, (user as any).passwordHash);
  if (!ok)   return { status: 401, body: { message: "Invalid credentials" } };

  return {
    status: 200,
    body: {
      message: "Login successful",
      token:   signToken(user as any),
      user:    publicUser(user)
    }
  };
}

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return null;
  const ok = await comparePassword(password, (user as any).passwordHash);
  if (!ok) return null;
  const role = (user as any).role as string;
  if (role !== "admin" && role !== "superAdmin") return null;
  return { id: (user as any)._id.toString(), role };
}

export async function forgotPassword(email: string) {  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return { status: 404, body: { message: "User not found" } };

  const rawToken = crypto.randomBytes(24).toString("hex");
  user.set({
    resetTokenHash: crypto.createHash("sha256").update(rawToken).digest("hex"),
    resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000)
  });
  await user.save();

  // No email transport is configured in this local setup, so the token is
  // returned to the caller and logged server-side for the recovery flow.
  console.log(`🔑 Password reset token for ${user.email}: ${rawToken} (expires in 15 minutes)`);

  return {
    status: 200,
    body: {
      message: "Reset token generated. Enter it on the reset page to set a new password.",
      resetToken: rawToken
    }
  };
}

export async function resetPassword(email: string, password: string, token: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return { status: 404, body: { message: "User not found" } };

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (!user.resetTokenHash || user.resetTokenHash !== tokenHash) {
    return { status: 400, body: { message: "Invalid or expired reset token" } };
  }
  if (!user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
    return { status: 400, body: { message: "Invalid or expired reset token" } };
  }

  user.set({
    passwordHash: await hashPassword(password),
    resetTokenHash: undefined,
    resetTokenExpires: undefined
  });
  await user.save();
  return { status: 200, body: { message: "Password updated successfully" } };
}

export async function deleteAccount(user: { id: string; email: string }) {
  const deleted = await UserModel.findByIdAndDelete(user.id).lean();
  if (!deleted) return { status: 404, body: { message: "Account not found" } };
  return { status: 200, body: { message: "Account deleted", user: publicUser(deleted) } };
}

export function normalizeGrade(value: unknown): Grade | undefined {
  return value === "10th" || value === "11th" || value === "12th" ? value : undefined;
}

export function normalizeStream(value: unknown): Stream | undefined {
  return value === "General" || value === "Medical" || value === "Non-Medical" || value === "Commerce" || value === "Arts"
    ? value : undefined;
}

// ─── Live Classes ───────────────────────────────────────────────────────────────

export async function listLiveClasses(filters: Partial<{ grade: Grade; stream: Stream; subject: string; status: string; category: string; teacherName: string; search: string }>) {
  const query: any = {};
  if (filters.grade)       query.grade = filters.grade;
  if (filters.stream)      query.stream = filters.stream;
  if (filters.subject)     query.subject = new RegExp(filters.subject, "i");
  if (filters.status)      query.status = new RegExp(`^${filters.status}$`, "i");
  if (filters.category)    query.category = new RegExp(filters.category, "i");
  if (filters.teacherName) query.teacherName = new RegExp(filters.teacherName, "i");
  if (filters.search) {
    query.$or = [
      { title:       new RegExp(filters.search, "i") },
      { subject:     new RegExp(filters.search, "i") },
      { category:    new RegExp(filters.search, "i") },
      { teacherName: new RegExp(filters.search, "i") },
      { description: new RegExp(filters.search, "i") }
    ];
  }
  const items = await LiveClassModel.find(query).sort({ createdAt: -1 }).lean();
  return { data: items.map(toPlain) };
}

export async function createLiveClass(payload: any) {
  const doc = await LiveClassModel.create({ ...payload, enrolledStudentsCount: payload.enrolledStudentsCount ?? 0 });
  return { data: toPlain(doc.toObject()) };
}

export async function updateLiveClass(id: string, updates: any) {
  const doc = await LiveClassModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!doc) return null;
  return toPlain(doc);
}

export async function deleteLiveClass(id: string) {
  const doc = await LiveClassModel.findByIdAndDelete(id).lean();
  if (!doc) return null;
  return toPlain(doc);
}

export async function publishLiveClass(id: string) {
  const item = await updateLiveClass(id, { status: "Published" });
  if (!item) return null;

  const notice = await NoticeModel.create({
    title:    `Live class published: ${item.title}`,
    body:     `${item.teacherName} will conduct ${item.subject} on ${item.date}.`,
    category: "Live Classes",
    date:     new Date().toLocaleDateString()
  });

  return { item, notice: toPlain(notice.toObject()) };
}

// ─── Content Services ───────────────────────────────────────────────────────────

export const contentServices = {
  async listNotes(filters: Partial<{ grade: Grade; stream: Stream; subject: string; search: string }>) {
    const docs = await NoteModel.find(buildContentQuery(filters)).sort({ createdAt: -1 }).lean();
    return { data: docs.map(toPlain) };
  },

  async createNote(payload: any) {
    const doc = await NoteModel.create(payload);
    return { data: toPlain(doc.toObject()) };
  },

  async deleteNote(id: string) {
    const doc = await NoteModel.findByIdAndDelete(id).lean();
    return doc ? toPlain(doc) : null;
  },

  async listPapers(filters: Partial<{ grade: Grade; stream: Stream; subject: string; search: string }>) {
    const docs = await PaperModel.find(buildContentQuery(filters)).sort({ createdAt: -1 }).lean();
    return { data: docs.map(toPlain) };
  },

  async createPaper(payload: any) {
    const doc = await PaperModel.create(payload);
    return { data: toPlain(doc.toObject()) };
  },

  async deletePaper(id: string) {
    const doc = await PaperModel.findByIdAndDelete(id).lean();
    return doc ? toPlain(doc) : null;
  },

  async listVideos(filters: Partial<{ grade: Grade; stream: Stream; subject: string; search: string }>, options?: { sort?: "latest" | "trending"; limit?: number }) {
    const sort: Record<string, 1 | -1> = options?.sort === "trending"
      ? { views: -1, createdAt: -1 }
      : { createdAt: -1 };
    let cursor = VideoModel.find(buildContentQuery(filters)).sort(sort).lean();
    if (options?.limit && options.limit > 0) cursor = cursor.limit(options.limit);
    const docs = await cursor;
    return { data: docs.map(toPlain) };
  },

  async incrementVideoView(id: string) {
    const doc = await VideoModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean();
    return doc ? toPlain(doc) : null;
  },

  async createVideo(payload: any) {
    const doc = await VideoModel.create(payload);
    return { data: toPlain(doc.toObject()) };
  },

  async deleteVideo(id: string) {
    const doc = await VideoModel.findByIdAndDelete(id).lean();
    return doc ? toPlain(doc) : null;
  },

  async listQuizzes(filters: Partial<{ grade: Grade; stream: Stream; subject: string; search: string }>) {
    const docs = await QuizModel.find(buildContentQuery(filters)).sort({ createdAt: -1 }).lean();
    return { data: docs.map(toPlain) };
  },

  async createQuiz(payload: any) {
    const doc = await QuizModel.create(payload);
    return { data: toPlain(doc.toObject()) };
  },

  async listNotices() {
    const docs = await NoticeModel.find().sort({ createdAt: -1 }).lean();
    return { data: docs.map(toPlain) };
  },

  async createNotice(payload: any) {
    const doc = await NoticeModel.create({
      ...payload,
      date: payload.date || new Date().toLocaleDateString()
    });
    return { data: toPlain(doc.toObject()) };
  },

  uploadFile(file: Express.Multer.File | undefined, baseUrl?: string) {
    if (!file) return null;
    const base = (process.env.SERVER_URL || baseUrl || "http://localhost:4000").replace(/\/$/, "");
    return {
      url:      `${base}/uploads/${file.filename}`,
      fileSize: `${Math.max(1, Math.ceil(file.size / 1024))} KB`
    };
  },

  async attendance(payload: any) {
    const doc = await AttendanceModel.create(payload);
    return { data: toPlain(doc.toObject()) };
  },

  async listAttendance() {
    const docs = await AttendanceModel.find().sort({ createdAt: -1 }).limit(200).lean();
    return { data: docs.map(toPlain) };
  },

  async reset() {
    // Clear all collections
    await Promise.all([
      UserModel.deleteMany({}),
      NoteModel.deleteMany({}),
      PaperModel.deleteMany({}),
      VideoModel.deleteMany({}),
      QuizModel.deleteMany({}),
      NoticeModel.deleteMany({}),
      LiveClassModel.deleteMany({}),
      AttendanceModel.deleteMany({})
    ]);

    // Re-seed from seed data
    const { users, notes, papers, videos, quizzes, notices, liveClasses } = seedState;

    await Promise.all([
      UserModel.insertMany(users.map(u => ({
        username: u.username, email: u.email, passwordHash: u.passwordHash,
        role: u.role, grade: u.grade, stream: u.stream
      }))),
      NoteModel.insertMany(notes.map(n => ({
        subject: n.subject, title: n.title, grade: n.grade, stream: n.stream,
        fileUrl: n.fileUrl, fileSize: n.fileSize, pages: n.pages, uploadDate: n.uploadDate
      }))),
      PaperModel.insertMany(papers.map(p => ({
        subject: p.subject, title: p.title, year: p.year, term: p.term,
        grade: p.grade, stream: p.stream, fileUrl: p.fileUrl, fileSize: p.fileSize
      }))),
      VideoModel.insertMany(videos.map(v => ({
        subject: v.subject, title: v.title, instructor: v.instructor, duration: v.duration,
        thumbnail: v.thumbnail, videoUrl: v.videoUrl, grade: v.grade, stream: v.stream
      }))),
      QuizModel.insertMany(quizzes),
      NoticeModel.insertMany(notices.map(n => ({
        title: n.title, body: n.body, category: n.category, date: n.date
      }))),
      LiveClassModel.insertMany(liveClasses.map(({ id: _omit, createdAt: _c, ...rest }) => rest))
    ]);

    return { message: "Seed data restored" };
  }
};
