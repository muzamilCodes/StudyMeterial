import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { comparePassword, hashPassword, signToken } from "./auth.js";
import { connectDb } from "./db.js";

type Grade = "10th" | "11th" | "12th";
type Stream = "General" | "Medical" | "Non-Medical" | "Commerce" | "Arts";

export type LiveClassLifecycle =
  | "Draft"
  | "Published"
  | "Upcoming"
  | "Starting Soon"
  | "Live"
  | "Completed"
  | "Recording Available"
  | "Archived";

export type LiveClassRecord = {
  _id?: ObjectId;
  id?: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  teacherName: string;
  teacherPhoto?: string;
  teacherBio?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  timeZone?: string;
  meetingPlatform: "Google Meet" | "Zoom" | "Jitsi" | "LiveKit" | "Custom";
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  maxStudents: number;
  enrolledStudentsCount?: number;
  language: string;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  bannerUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  status: LiveClassLifecycle;
  allowRecording: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  allowStudentQuestions: boolean;
  attachments?: Array<{ title: string; type: string; url: string; size?: string }>;
  prerequisites?: string[];
  learningOutcomes?: string[];
  recordingUrl?: string;
  homeworkUrl?: string;
  grade: Grade;
  stream: Stream;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LiveClassAttendanceRecord = {
  _id?: ObjectId;
  classId: string;
  studentId?: string;
  studentName: string;
  email: string;
  joinTime: string;
  leaveTime?: string;
  totalDurationMinutes?: number;
  status: "Present" | "Late" | "Absent";
  createdAt?: Date;
};

export type LiveClassChatRecord = {
  _id?: ObjectId;
  classId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "admin";
  text: string;
  time: string;
  createdAt?: Date;
};

export type LiveClassFeedbackRecord = {
  _id?: ObjectId;
  classId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt?: Date;
};

type UserRecord = {
  _id?: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: "student" | "admin";
  isAdmin?: boolean;
  grade: Grade;
  stream: Stream;
  createdAt: Date;
  updatedAt: Date;
};

type ResetTokenRecord = {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

export async function getSubjectsByGradeStream(grade: Grade, stream: Stream) {
  const db = await connectDb();
  if (!db) return [];

  const collection = db.collection("subjects");
  const existing = await collection.find({ grade, stream }).toArray();
  return existing;
}

export async function getDashboardSummary() {
  const db = await connectDb();
  if (!db) {
    return {
      stats: [
        { label: "Users", value: "0", accent: "blue" as const },
        { label: "Students", value: "0", accent: "indigo" as const },
        { label: "Admins", value: "0", accent: "amber" as const },
        { label: "Notes", value: "0", accent: "orange" as const },
        { label: "Papers", value: "0", accent: "indigo" as const },
        { label: "Quizzes", value: "0", accent: "emerald" as const },
        { label: "Live Classes", value: "0", accent: "rose" as const },
        { label: "Notices", value: "0", accent: "purple" as const }
      ],
      notices: [],
      progress: [],
      distributions: {
        medical: 0,
        nonMedical: 0,
        commerce: 0,
        arts: 0,
        general: 0
      }
    };
  }

  const [
    users, 
    students, 
    admins, 
    notes, 
    papers, 
    quizzes, 
    notices, 
    liveClasses,
    publishedClasses,
    streamAgg
  ] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("users").countDocuments({ role: "student" }),
    db.collection("users").countDocuments({ $or: [{ role: "admin" }, { isAdmin: true }] }),
    db.collection("notes").countDocuments(),
    db.collection("previous_papers").countDocuments(),
    db.collection("quizzes").countDocuments(),
    db.collection("notices").countDocuments(),
    db.collection("live_classes").countDocuments(),
    db.collection("live_classes").countDocuments({ status: { $in: ["Published", "Live", "Upcoming"] } }),
    db.collection("users").aggregate([{ $group: { _id: "$stream", count: { $sum: 1 } } }]).toArray()
  ]);

  const recentNotices = await db.collection("notices").find({}).sort({ createdAt: -1 }).limit(4).toArray();

  const distributions = {
    medical: streamAgg.find(s => s._id === "Medical")?.count || 0,
    nonMedical: streamAgg.find(s => s._id === "Non-Medical")?.count || 0,
    commerce: streamAgg.find(s => s._id === "Commerce")?.count || 0,
    arts: streamAgg.find(s => s._id === "Arts")?.count || 0,
    general: streamAgg.find(s => s._id === "General")?.count || 0
  };

  return {
    stats: [
      { label: "Users", value: String(users), accent: "blue" as const },
      { label: "Students", value: String(students), accent: "indigo" as const },
      { label: "Admins", value: String(admins), accent: "amber" as const },
      { label: "Notes", value: String(notes), accent: "orange" as const },
      { label: "Papers", value: String(papers), accent: "indigo" as const },
      { label: "Quizzes", value: String(quizzes), accent: "emerald" as const },
      { label: "Live Classes", value: String(liveClasses), accent: "rose" as const },
      { label: "Published Classes", value: String(publishedClasses), accent: "rose" as const },
      { label: "Notices", value: String(notices), accent: "purple" as const }
    ],
    notices: recentNotices,
    progress: [
      { label: "Active Live Sessions", value: String(publishedClasses) },
      { label: "Total Quizzes", value: String(quizzes) },
      { label: "PDF Notes Repository", value: String(notes) },
      { label: "Solved Board Papers", value: String(papers) }
    ],
    distributions
  };
}

export async function getRegisteredUsers() {
  const db = await connectDb();
  if (!db) return [];
  const users = await db.collection("users").find({}, { projection: { passwordHash: 0 } }).toArray();
  return users;
}

export async function loginStudent(input: { email: string; password: string }) {
  const db = await connectDb();
  const normalizedEmail = input.email.trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@studymaterial.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  if (normalizedEmail === adminEmail && input.password === adminPassword) {
    return {
      mode: "admin" as const,
      token: signToken({ userId: "admin_001", role: "admin", email: normalizedEmail }),
      user: {
        id: "admin_001",
        email: normalizedEmail,
        username: "System Admin",
        role: "admin" as const,
        isAdmin: true,
        grade: "11th" as const,
        stream: "Medical" as const
      }
    };
  }

  if (!db) {
    throw new Error("Database connection unavailable");
  }

  const usersCollection = db.collection<UserRecord>("users");
  const user = await usersCollection.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("User with this email does not exist");
  }

  const isValidPassword = await comparePassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid password credentials");
  }

  const userId = user._id ? user._id.toString() : "user_" + Date.now();
  const isAdminRole = user.role === "admin" || user.isAdmin === true;
  const token = signToken({ userId, role: isAdminRole ? "admin" : "student", email: user.email });

  return {
    mode: isAdminRole ? ("admin" as const) : ("student" as const),
    token,
    user: {
      id: userId,
      email: user.email,
      username: user.username,
      role: isAdminRole ? ("admin" as const) : ("student" as const),
      isAdmin: isAdminRole,
      grade: user.grade,
      stream: user.stream
    }
  };
}

export async function registerStudent(input: {
  username: string;
  email: string;
  password: string;
  grade: Grade;
  stream: Stream;
}) {
  const db = await connectDb();
  if (!db) {
    throw new Error("Database connection unavailable");
  }

  const usersCollection = db.collection<UserRecord>("users");
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await usersCollection.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const isAdminEmail = normalizedEmail === (process.env.ADMIN_EMAIL ?? "admin@studymaterial.com").trim().toLowerCase();

  const newUser: UserRecord = {
    username: input.username,
    email: normalizedEmail,
    passwordHash,
    role: isAdminEmail ? "admin" : "student",
    isAdmin: isAdminEmail,
    grade: input.grade,
    stream: input.grade === "10th" ? "General" : input.stream,
    createdAt: now,
    updatedAt: now
  };

  const result = await usersCollection.insertOne(newUser);
  const userId = result.insertedId.toString();

  const token = signToken({ userId, role: newUser.role, email: normalizedEmail });

  return {
    token,
    user: {
      id: userId,
      email: normalizedEmail,
      username: input.username,
      role: newUser.role,
      isAdmin: newUser.isAdmin,
      grade: newUser.grade,
      stream: newUser.stream
    }
  };
}

export async function requestPasswordReset(email: string) {
  const db = await connectDb();
  const normalizedEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  if (db) {
    const tokensCollection = db.collection<ResetTokenRecord>("reset_tokens");
    await tokensCollection.deleteMany({ email: normalizedEmail });
    await tokensCollection.insertOne({
      email: normalizedEmail,
      token,
      expiresAt,
      createdAt: new Date()
    });
  }

  return {
    token,
    expiresAt,
    resetUrl: `/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`
  };
}

export async function resetPasswordWithToken(input: { email: string; token: string; newPassword: string }) {
  const db = await connectDb();
  if (!db) {
    throw new Error("Database not connected");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const tokensCollection = db.collection<ResetTokenRecord>("reset_tokens");
  const usersCollection = db.collection<UserRecord>("users");

  const resetRecord = await tokensCollection.findOne({
    email: normalizedEmail,
    token: input.token
  });

  if (!resetRecord) {
    throw new Error("Invalid or expired password reset token");
  }

  if (new Date() > new Date(resetRecord.expiresAt)) {
    await tokensCollection.deleteOne({ email: normalizedEmail, token: input.token });
    throw new Error("Reset token has expired. Please request a new link.");
  }

  const passwordHash = await hashPassword(input.newPassword);
  await usersCollection.updateOne(
    { email: normalizedEmail },
    { $set: { passwordHash, updatedAt: new Date() } }
  );

  await tokensCollection.deleteMany({ email: normalizedEmail });
  return true;
}

export async function deleteUserAccountByEmail(email: string) {
  const db = await connectDb();
  if (!db) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const result = await db.collection("users").deleteOne({ email: normalizedEmail });
  return result.deletedCount > 0;
}

type ContentDoc = Record<string, unknown> & {
  createdAt?: Date;
  updatedAt?: Date;
};

function collectionName(type: string) {
  return {
    notes: "notes",
    papers: "previous_papers",
    videos: "videos",
    quizzes: "quizzes",
    notices: "notices",
    downloads: "downloads",
    results: "results",
    live_classes: "live_classes"
  }[type];
}

export async function listContent(type: string, filter: Record<string, unknown> = {}) {
  const db = await connectDb();
  if (!db) return [];
  const collection = collectionName(type);
  if (!collection) return [];
  return db.collection<ContentDoc>(collection).find(filter).sort({ createdAt: -1 }).toArray();
}

export async function createContent(type: string, payload: ContentDoc) {
  const db = await connectDb();
  if (!db) {
    throw new Error("Database not configured");
  }
  const collection = collectionName(type);
  if (!collection) throw new Error("Invalid content type");

  const doc = {
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(collection).insertOne(doc);
  return { insertedId: result.insertedId.toString(), ...doc };
}

export async function deleteContent(type: string, id: string) {
  const db = await connectDb();
  if (!db) throw new Error("Database not configured");
  const collection = collectionName(type);
  if (!collection) throw new Error("Invalid content type");

  try {
    let result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      result = await db.collection(collection).deleteOne({ id: id });
    }
    return true;
  } catch {
    await db.collection(collection).deleteOne({ id: id });
    return true;
  }
}

// ============================================================================
// ENTERPRISE LIVE CLASSES MANAGEMENT SERVICES
// ============================================================================

export async function listLiveClassesService(filter: {
  grade?: Grade;
  stream?: Stream;
  subject?: string;
  status?: string;
  category?: string;
  teacherName?: string;
  search?: string;
}) {
  const db = await connectDb();
  if (!db) return [];

  const query: Record<string, unknown> = {};
  if (filter.grade) query.grade = filter.grade;
  if (filter.stream) query.stream = filter.stream;
  if (filter.subject) query.subject = filter.subject;
  if (filter.status && filter.status !== "All") query.status = filter.status;
  if (filter.category && filter.category !== "All") query.category = filter.category;
  if (filter.teacherName && filter.teacherName !== "All") query.teacherName = filter.teacherName;
  if (filter.search) {
    query.$or = [
      { title: { $regex: filter.search, $options: "i" } },
      { subject: { $regex: filter.search, $options: "i" } },
      { teacherName: { $regex: filter.search, $options: "i" } },
      { category: { $regex: filter.search, $options: "i" } }
    ];
  }

  const items = await db.collection("live_classes").find(query).sort({ createdAt: -1 }).toArray();
  return items;
}

export async function getLiveClassByIdService(id: string) {
  const db = await connectDb();
  if (!db) return null;
  try {
    let doc = await db.collection("live_classes").findOne({ _id: new ObjectId(id) });
    if (!doc) doc = await db.collection("live_classes").findOne({ id: id });
    return doc;
  } catch {
    return null;
  }
}

export async function createLiveClassService(payload: LiveClassRecord) {
  const db = await connectDb();
  if (!db) throw new Error("Database not configured");

  const doc = {
    ...payload,
    enrolledStudentsCount: payload.enrolledStudentsCount || 0,
    status: payload.status || "Published",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection("live_classes").insertOne(doc);
  return { insertedId: result.insertedId.toString(), ...doc };
}

export async function updateLiveClassService(id: string, payload: Partial<LiveClassRecord>) {
  const db = await connectDb();
  if (!db) throw new Error("Database not configured");

  let result = await db.collection("live_classes").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...payload, updatedAt: new Date() } }
  );

  if (result.modifiedCount === 0) {
    result = await db.collection("live_classes").updateOne(
      { id: id },
      { $set: { ...payload, updatedAt: new Date() } }
    );
  }

  return true;
}

export async function publishLiveClassService(id: string) {
  const db = await connectDb();
  if (!db) throw new Error("Database not configured");

  let query: Record<string, unknown> = { id: id };
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { id: id };
  }

  const classDoc = await db.collection("live_classes").findOne(query);
  await db.collection("live_classes").updateOne(query, {
    $set: { status: "Published", updatedAt: new Date() }
  });

  const title = classDoc?.title || "Live Interactive Lecture";
  const teacher = classDoc?.teacherName || "Faculty Teacher";
  const date = classDoc?.date || "Today";

  await db.collection("notices").insertOne({
    title: `📢 Live Class Published: ${title}`,
    body: `Live class on "${title}" by ${teacher} has been published for ${date}. Join now from Live Classes stream!`,
    category: "Live Classes",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    createdAt: new Date()
  });

  return true;
}

export async function deleteLiveClassService(id: string) {
  const db = await connectDb();
  if (!db) throw new Error("Database not configured");

  try {
    let result = await db.collection("live_classes").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      result = await db.collection("live_classes").deleteOne({ id: id });
    }
    return true;
  } catch {
    await db.collection("live_classes").deleteOne({ id: id });
    return true;
  }
}

export async function logLiveAttendanceService(attendance: LiveClassAttendanceRecord) {
  const db = await connectDb();
  if (!db) return false;

  const doc = {
    ...attendance,
    createdAt: new Date()
  };

  await db.collection("live_class_attendance").insertOne(doc);
  return true;
}

export async function postLiveChatService(message: LiveClassChatRecord) {
  const db = await connectDb();
  if (!db) return false;

  const doc = {
    ...message,
    createdAt: new Date()
  };

  await db.collection("live_class_chat").insertOne(doc);
  return true;
}

export async function getLiveChatService(classId: string) {
  const db = await connectDb();
  if (!db) return [];

  const items = await db.collection("live_class_chat").find({ classId }).sort({ createdAt: 1 }).toArray();
  return items;
}

export async function submitLiveFeedbackService(feedback: LiveClassFeedbackRecord) {
  const db = await connectDb();
  if (!db) return false;

  const doc = {
    ...feedback,
    createdAt: new Date()
  };

  await db.collection("live_class_feedback").insertOne(doc);
  return true;
}

export const createResetToken = requestPasswordReset;
export const resetPassword = resetPasswordWithToken;
