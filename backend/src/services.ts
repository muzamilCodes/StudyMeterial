import crypto from "node:crypto";
import { comparePassword, hashPassword, signToken } from "./auth.js";
import { generateOtp } from "./helpers/otp.js";
import { sendOtpEmail, sendOtpWhatsApp, sendInstructorDecisionEmail, sendInstructorReviewRequest } from "./messaging.js";
import { emailConfigured, whatsappConfigured } from "./config/env.js";
import {
  AttendanceModel,
  InstructorApplicationModel,
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

function humanSize(bytes: number) {
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

/** Public base URL used to build links for instructor application uploads. */
function instructorBaseUrl() {
  return (process.env.SERVER_URL || "http://localhost:4100").replace(/\/$/, "");
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
    approvalStatus: user.approvalStatus ?? "approved",
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

  // Instructor accounts stay inactive until an administrator approves their application.
  if ((user as any).role === "teacher" && (user as any).approvalStatus !== "approved") {
    return {
      status: 403,
      body: {
        message: `Your instructor application is ${(user as any).approvalStatus}. You can sign in only after an administrator approves it. Check your status on the "Application status" page.`
      }
    };
  }

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

export async function forgotPassword(email: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
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

// ─── Instructor applications (registration → admin approval) ─────────────────

const applicationCard = (app: any) => ({
  id:         app._id.toString(),
  fullName:   app.personal.fullName,
  email:      app.personal.email,
  phone:      app.personal.phone,
  country:    app.personal.country,
  state:      app.personal.state,
  city:       app.personal?.city ?? "",
  addressLine: app.personal?.addressLine ?? "",
  message:    app.personal?.messageToAdmin ?? "",
  profilePhotoUrl: app.personal.profilePhotoUrl ?? null,
  headline:   app.professional.headline,
  bio:        app.professional.bio,
  subjects:   app.selectedSubjects?.length ? app.selectedSubjects : app.professional.subjectExpertise,
  selectedClasses: app.selectedClasses ?? [],
  selectedSubjects: app.selectedSubjects ?? [],
  classSubjects: app.classSubjects ?? [],
  teachingCategories: app.teachingCategories ?? [],
  preferredLanguage: app.professional?.preferredLanguage ?? "English",
  experience: app.professional.teachingExperience,
  occupation: app.professional.currentOccupation,
  education: {
    qualification: app.education?.highestQualification ?? "",
    degree:        app.education?.degreeName ?? "",
    specialization: app.education?.specialization ?? "",
    college:       app.education?.collegeUniversity ?? "",
    passingYear:   app.education?.passingYear ?? "",
    certificates:  app.education?.certificates ?? []
  },
  documents: {
    resume:              app.documents?.resume ?? null,
    teachingCertificate: app.documents?.teachingCertificate ?? null,
    introVideo:          app.documents?.introVideo ?? null,
    sampleVideo:         app.documents?.sampleVideo ?? null
  },
  status:     app.status,
  submittedAt: app.createdAt,
  reviewedAt:  app.reviewedAt,
  reviewNote:  app.reviewNote
});

type InstructorFilesPayload = {
  profilePhoto?:        Express.Multer.File;
  resume:               Express.Multer.File;
  teachingCertificate?: Express.Multer.File;
  introVideo?:          Express.Multer.File;
  sampleVideo?:         Express.Multer.File;
  certificates:         Express.Multer.File[];
};

export async function submitInstructorApplication(payload: any, files: InstructorFilesPayload) {
  const email = String(payload.personal?.email ?? "").toLowerCase();
  const phone = normalizePhone(payload.personal?.phone ?? "");

  const orFilters: any[] = [{ email }];
  if (phone) orFilters.push({ phone });
  const existingUser = await UserModel.findOne({ $or: orFilters }).lean();
  if (existingUser) {
    const role = (existingUser as any).role;
    if (role === "teacher") {
      const st = (existingUser as any).approvalStatus ?? "approved";
      if (st === "approved") return { status: 409, body: { message: "This email already has an approved instructor account. Sign in from the teacher login page." } };
      if (st === "pending")  return { status: 409, body: { message: "An application for this email is already pending review. You will be notified once it is decided." } };
    }
    return { status: 409, body: { message: "An account with this email or phone number already exists. Please sign in instead." } };
  }

  const prior = await InstructorApplicationModel.findOne({ "personal.email": email });
  if (prior && prior.status !== "rejected") {
    return { status: 409, body: { message: prior.status === "pending"
      ? "Your application is already submitted and awaiting admin review."
      : "Your application has already been approved. Sign in from the teacher login page." } };
  }

  const publicUrl = (f: Express.Multer.File) => `${instructorBaseUrl()}/uploads/${f.filename}`;

  const selectedClasses: string[] = Array.isArray(payload.selectedClasses) ? payload.selectedClasses : [];
  const selectedSubjects: string[] = Array.isArray(payload.selectedSubjects) ? payload.selectedSubjects : (payload.professional?.subjectExpertise || []);

  // Generate classSubjects if not provided or empty
  let classSubjects = Array.isArray(payload.classSubjects) && payload.classSubjects.length > 0
    ? payload.classSubjects
    : selectedClasses.map((cls) => ({ class: cls, subjects: selectedSubjects }));

  // Generate teaching categories pairs
  const teachingCategories: Array<{ class: string; subject: string }> = [];
  for (const cs of classSubjects) {
    for (const sub of (cs.subjects || [])) {
      teachingCategories.push({ class: cs.class, subject: sub });
    }
  }

  const doc: any = {
    personal: {
      ...payload.personal,
      email,
      phone,
      profilePhotoUrl: files.profilePhoto ? publicUrl(files.profilePhoto) : undefined
    },
    professional: {
      ...payload.professional,
      subjectExpertise: selectedSubjects,
      preferredLanguage: payload.professional?.preferredLanguage || payload.preferredLanguage || "English"
    },
    selectedClasses,
    selectedSubjects,
    classSubjects,
    teachingCategories,
    education: {
      ...payload.education,
      certificates: files.certificates.map((f) => ({ name: f.originalname, url: publicUrl(f), size: humanSize(f.size) }))
    },
    documents: {
      resume:              { name: files.resume.originalname, url: publicUrl(files.resume), size: humanSize(files.resume.size), mimeType: files.resume.mimetype },
      teachingCertificate: files.teachingCertificate
        ? { name: files.teachingCertificate.originalname, url: publicUrl(files.teachingCertificate), size: humanSize(files.teachingCertificate.size), mimeType: files.teachingCertificate.mimetype }
        : undefined,
      introVideo: files.introVideo
        ? { name: files.introVideo.originalname, url: publicUrl(files.introVideo), size: humanSize(files.introVideo.size), mimeType: files.introVideo.mimetype }
        : undefined,
      sampleVideo: files.sampleVideo
        ? { name: files.sampleVideo.originalname, url: publicUrl(files.sampleVideo), size: humanSize(files.sampleVideo.size), mimeType: files.sampleVideo.mimetype }
        : undefined
    },
    passwordHash: await hashPassword(payload.password),
    status: "pending"
  };

  let saved: any;
  if (prior) {
    prior.set({ ...doc, reviewedAt: undefined, reviewNote: undefined, reviewedBy: undefined });
    saved = await prior.save();
  } else {
    saved = await InstructorApplicationModel.create(doc);
  }

  const admins = await UserModel.find({ role: { $in: ["admin", "superAdmin"] } }).select("email").lean();
  for (const admin of admins) {
    void sendInstructorReviewRequest((admin as any).email, saved.personal.fullName, saved.personal.email);
  }

  return { status: 201, body: { message: "Application submitted", application: applicationCard(saved) } };
}

export async function getInstructorApplicationStatus(email: string) {
  const app = await InstructorApplicationModel.findOne({ "personal.email": email.toLowerCase() }).lean();
  if (!app) return { status: 404, body: { message: "No instructor application found for this email address." } };
  return { status: 200, body: { application: applicationCard(app) } };
}

export async function listInstructorApplications(status?: string) {
  const filter: any = status && status !== "all" ? { status } : {};
  const apps = await InstructorApplicationModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return { data: apps.map(applicationCard) };
}

export async function resolveInstructorApplication(id: string, decision: "approved" | "rejected", note: string, reviewerEmail: string) {
  const app: any = await InstructorApplicationModel.findById(id);
  if (!app) return { status: 404, body: { message: "Application not found" } };
  if (app.status !== "pending") return { status: 409, body: { message: `This application was already ${app.status}.` } };

  if (decision === "rejected") {
    app.set({ status: "rejected", reviewNote: note || undefined, reviewedBy: reviewerEmail, reviewedAt: new Date() });
    await app.save();
    void sendInstructorDecisionEmail(app.personal.email, app.personal.fullName, "rejected", note);
    return { status: 200, body: { message: `Rejected ${app.personal.email}`, application: applicationCard(app) } };
  }

  const email = app.personal.email;
  const user = await UserModel.findOne({ email });

  const selectedClasses = app.selectedClasses || [];
  const selectedSubjects = app.selectedSubjects?.length ? app.selectedSubjects : (app.professional?.subjectExpertise || []);
  const classSubjects = app.classSubjects && app.classSubjects.length > 0
    ? app.classSubjects
    : selectedClasses.map((cls: string) => ({ class: cls, subjects: selectedSubjects }));

  const teachingPermissions = {
    classes: selectedClasses,
    subjects: selectedSubjects,
    classSubjects
  };

  if (!user) {
    await UserModel.create({
      username:        app.personal.fullName,
      email,
      phone:           app.personal.phone || undefined,
      passwordHash:    app.passwordHash,
      role:            "teacher",
      grade:           "11th",
      stream:          "General",
      approvalStatus:  "approved",
      headline:        app.professional?.headline || "",
      bio:             app.professional?.bio || "",
      teachingExperience: app.professional?.teachingExperience || "",
      currentOccupation: app.professional?.currentOccupation || "",
      preferredLanguage: app.professional?.preferredLanguage || "English",
      profilePhotoUrl: app.personal?.profilePhotoUrl || "",
      teachingPermissions
    } as any);
  } else {
    user.set({
      role: "teacher",
      approvalStatus: "approved",
      headline: app.professional?.headline || user.headline,
      bio: app.professional?.bio || user.bio,
      teachingExperience: app.professional?.teachingExperience || user.teachingExperience,
      currentOccupation: app.professional?.currentOccupation || user.currentOccupation,
      preferredLanguage: app.professional?.preferredLanguage || user.preferredLanguage,
      profilePhotoUrl: app.personal?.profilePhotoUrl || user.profilePhotoUrl,
      teachingPermissions
    });
    await user.save();
  }

  app.set({ status: "approved", reviewNote: note || undefined, reviewedBy: reviewerEmail, reviewedAt: new Date(), approvedUserEmail: email });
  await app.save();

  void sendInstructorDecisionEmail(email, app.personal.fullName, "approved", note);
  return { status: 200, body: { message: `Approved ${email} — instructor account is active`, application: applicationCard(app) } };
}

// ─── Instructor Profile & Permission Requests ───────────────────────────────

export async function getInstructorProfile(userId: string) {
  const user: any = await UserModel.findById(userId).lean();
  if (!user) return { status: 404, body: { message: "User not found" } };

  return {
    status: 200,
    body: {
      data: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        approvalStatus: user.approvalStatus,
        headline: user.headline || "",
        bio: user.bio || "",
        teachingExperience: user.teachingExperience || "",
        currentOccupation: user.currentOccupation || "",
        preferredLanguage: user.preferredLanguage || "English",
        profilePhotoUrl: user.profilePhotoUrl || "",
        teachingPermissions: user.teachingPermissions || { classes: [], subjects: [], classSubjects: [] },
        permissionRequests: (user.permissionRequests || []).map((r: any) => ({
          id: r._id.toString(),
          requestedClasses: r.requestedClasses || [],
          requestedSubjects: r.requestedSubjects || [],
          requestedClassSubjects: r.requestedClassSubjects || [],
          reason: r.reason || "",
          status: r.status,
          reviewNote: r.reviewNote || "",
          reviewedBy: r.reviewedBy || "",
          reviewedAt: r.reviewedAt,
          createdAt: r.createdAt
        }))
      }
    }
  };
}

export async function updateInstructorProfile(userId: string, updates: {
  headline?: string;
  bio?: string;
  teachingExperience?: string;
  currentOccupation?: string;
  preferredLanguage?: string;
  profilePhotoUrl?: string;
}) {
  const user: any = await UserModel.findById(userId);
  if (!user) return { status: 404, body: { message: "User not found" } };

  if (typeof updates.headline === "string") user.headline = updates.headline.trim();
  if (typeof updates.bio === "string") user.bio = updates.bio.trim();
  if (typeof updates.teachingExperience === "string") user.teachingExperience = updates.teachingExperience.trim();
  if (typeof updates.currentOccupation === "string") user.currentOccupation = updates.currentOccupation.trim();
  if (typeof updates.preferredLanguage === "string") user.preferredLanguage = updates.preferredLanguage.trim();
  if (typeof updates.profilePhotoUrl === "string") user.profilePhotoUrl = updates.profilePhotoUrl.trim();

  await user.save();
  return { status: 200, body: { message: "Profile updated successfully.", data: user.toObject() } };
}

export async function submitTeachingPermissionRequest(userId: string, data: {
  requestedClasses: string[];
  requestedSubjects: string[];
  requestedClassSubjects?: Array<{ class: string; subjects: string[] }>;
  reason?: string;
}) {
  const user: any = await UserModel.findById(userId);
  if (!user) return { status: 404, body: { message: "User not found" } };

  const reqObj = {
    requestedClasses: data.requestedClasses,
    requestedSubjects: data.requestedSubjects,
    requestedClassSubjects: data.requestedClassSubjects || data.requestedClasses.map((cls) => ({ class: cls, subjects: data.requestedSubjects })),
    reason: data.reason || "",
    status: "pending",
    createdAt: new Date()
  };

  user.permissionRequests.push(reqObj);
  await user.save();

  return { status: 201, body: { message: "Class & subject permission request submitted for admin review." } };
}

export async function listAllPermissionRequests(status = "all") {
  const filter: any = { role: "teacher" };
  const teachers: any[] = await UserModel.find(filter).lean();

  const out: any[] = [];
  for (const t of teachers) {
    for (const r of (t.permissionRequests || [])) {
      if (status !== "all" && r.status !== status) continue;
      out.push({
        id: r._id.toString(),
        instructorId: t._id.toString(),
        instructorName: t.username,
        instructorEmail: t.email,
        requestedClasses: r.requestedClasses || [],
        requestedSubjects: r.requestedSubjects || [],
        requestedClassSubjects: r.requestedClassSubjects || [],
        reason: r.reason || "",
        status: r.status,
        reviewNote: r.reviewNote || "",
        reviewedBy: r.reviewedBy || "",
        reviewedAt: r.reviewedAt,
        createdAt: r.createdAt
      });
    }
  }

  out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { data: out };
}

export async function resolveTeachingPermissionRequest(requestId: string, decision: "approved" | "rejected", note: string, adminEmail: string) {
  const user: any = await UserModel.findOne({ "permissionRequests._id": requestId });
  if (!user) return { status: 404, body: { message: "Permission request not found." } };

  const reqItem = user.permissionRequests.id(requestId);
  if (!reqItem) return { status: 404, body: { message: "Request item not found." } };
  if (reqItem.status !== "pending") return { status: 409, body: { message: `Request is already ${reqItem.status}.` } };

  reqItem.status = decision;
  reqItem.reviewNote = note || undefined;
  reqItem.reviewedBy = adminEmail;
  reqItem.reviewedAt = new Date();

  if (decision === "approved") {
    const existingPerms = user.teachingPermissions || { classes: [], subjects: [], classSubjects: [] };
    const mergedClasses = Array.from(new Set([...(existingPerms.classes || []), ...(reqItem.requestedClasses || [])]));
    const mergedSubjects = Array.from(new Set([...(existingPerms.subjects || []), ...(reqItem.requestedSubjects || [])]));

    const existingMap = new Map<string, Set<string>>();
    for (const cs of (existingPerms.classSubjects || [])) {
      existingMap.set(cs.class, new Set(cs.subjects || []));
    }
    for (const cs of (reqItem.requestedClassSubjects || [])) {
      if (!existingMap.has(cs.class)) existingMap.set(cs.class, new Set());
      for (const s of (cs.subjects || [])) existingMap.get(cs.class)!.add(s);
    }

    const mergedClassSubjects = Array.from(existingMap.entries()).map(([cls, subs]) => ({
      class: cls,
      subjects: Array.from(subs)
    }));

    user.teachingPermissions = {
      classes: mergedClasses,
      subjects: mergedSubjects,
      classSubjects: mergedClassSubjects
    };
  }

  await user.save();
  return {
    status: 200,
    body: {
      message: `Permission request ${decision}.`,
      teachingPermissions: user.teachingPermissions
    }
  };
}

