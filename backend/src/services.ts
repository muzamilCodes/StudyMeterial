import crypto from "crypto";
import { ObjectId } from "mongodb";
import { comparePassword, hashPassword, signToken } from "./auth.js";
import { connectDb } from "./db.js";
import type { Grade, Stream } from "./types.js";

type UserRecord = {
  _id?: ObjectId;
  username?: string;
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

export async function getSubjectsForClass(grade: Grade, stream: Stream) {
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
        { label: "Notes", value: "0", accent: "orange" as const },
        { label: "Papers", value: "0", accent: "indigo" as const },
        { label: "Quizzes", value: "0", accent: "emerald" as const }
      ],
      notices: [],
      progress: []
    };
  }

  const [users, notes, papers, quizzes, notices] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("notes").countDocuments(),
    db.collection("previous_papers").countDocuments(),
    db.collection("quizzes").countDocuments(),
    db.collection("notices").find({}).sort({ createdAt: -1 }).limit(3).toArray()
  ]);

  return {
    stats: [
      { label: "Users", value: String(users), accent: "blue" as const },
      { label: "Notes", value: String(notes), accent: "orange" as const },
      { label: "Papers", value: String(papers), accent: "indigo" as const },
      { label: "Quizzes", value: String(quizzes), accent: "emerald" as const }
    ],
    notices: notices,
    progress: [
      { label: "Completed Quizzes", value: String(quizzes) },
      { label: "Downloaded Notes", value: String(notes) },
      { label: "Downloaded Papers", value: String(papers) }
    ]
  };
}

export async function loginStudent(input: { email: string; password: string }) {
  const db = await connectDb();
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@studymaterial.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  if (input.email === adminEmail && input.password === adminPassword) {
    return {
      mode: "admin" as const,
      token: signToken({ userId: "admin_001", role: "admin", email: input.email }),
      user: { id: "admin_001", email: input.email, role: "admin" as const }
    };
  }

  if (!db) {
    if (input.email.endsWith("@example.com") && input.password.length >= 6) {
      return {
        mode: "mock" as const,
        token: signToken({ userId: "mock_student", role: "student", email: input.email }),
        user: { id: "mock_student", email: input.email, role: "student" as const }
      };
    }
    throw new Error("Database not configured");
  }

  const user = await db.collection<UserRecord>("users").findOne({ email: input.email });
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  const id = user._id?.toString() ?? input.email;
  const isAdmin = user.role === "admin" || user.isAdmin === true;
  return {
    mode: (isAdmin ? "admin" : "db") as const,
    token: signToken({ userId: id, role: isAdmin ? "admin" : user.role, email: user.email }),
    user: {
      id,
      email: user.email,
      username: user.username,
      role: isAdmin ? ("admin" as const) : user.role,
      isAdmin,
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
  const passwordHash = await hashPassword(input.password);

  if (!db) {
    return {
      mode: "mock" as const,
      token: signToken({ userId: "mock_student", role: "student", email: input.email }),
      user: {
        id: "mock_student",
        email: input.email,
        username: input.username,
        grade: input.grade,
        stream: input.stream,
        role: "student" as const,
        isAdmin: false
      }
    };
  }

  const users = db.collection<UserRecord>("users");
  const existing = await users.findOne({ email: input.email });
  if (existing) throw new Error("User already exists");

  const now = new Date();
  const result = await users.insertOne({
    username: input.username,
    email: input.email,
    passwordHash,
    role: "student",
    isAdmin: false,
    grade: input.grade,
    stream: input.stream,
    createdAt: now,
    updatedAt: now
  });

  return {
    mode: "db" as const,
    token: signToken({ userId: result.insertedId.toString(), role: "student", email: input.email }),
    user: {
      id: result.insertedId.toString(),
      email: input.email,
      username: input.username,
      grade: input.grade,
      stream: input.stream,
      role: "student" as const,
      isAdmin: false
    }
  };
}

export async function createResetToken(email: string) {
  const db = await connectDb();
  const token = crypto.randomUUID();
  if (!db) return { mode: "mock" as const, token };

  const resets = db.collection<ResetTokenRecord>("password_resets");
  await resets.insertOne({
    email,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    createdAt: new Date()
  });
  return { mode: "db" as const, token };
}

export async function resetPassword(input: { token: string; password: string }) {
  const db = await connectDb();
  const passwordHash = await hashPassword(input.password);
  if (!db) return { mode: "mock" as const };

  const resets = db.collection<ResetTokenRecord>("password_resets");
  const record = await resets.findOne({ token: input.token });
  if (!record || record.expiresAt < new Date()) throw new Error("Invalid or expired reset token");

  await db.collection<UserRecord>("users").updateOne(
    { email: record.email },
    { $set: { passwordHash, updatedAt: new Date() } }
  );
  await resets.deleteMany({ email: record.email });

  return { mode: "db" as const };
}

type ContentDoc = {
  grade?: Grade;
  stream?: Stream;
  subject?: string;
  title?: string;
  year?: string;
  category?: string;
  body?: string;
  fileUrl?: string;
  videoUrl?: string;
  questions?: Array<{ question: string; options: string[]; answer: string }>;
  durationMinutes?: number;
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
    results: "results"
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
  return { id: result.insertedId.toString(), ...doc };
}
