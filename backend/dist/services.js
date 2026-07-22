import crypto from "node:crypto";
import { comparePassword, hashPassword, signToken } from "./auth.js";
import { connectDb } from "./db.js";
import { ObjectId } from "mongodb";
export async function getSubjectsByGradeStream(grade, stream) {
    const db = await connectDb();
    if (!db)
        return [];
    const collection = db.collection("subjects");
    const existing = await collection.find({ grade, stream }).toArray();
    return existing;
}
export async function getDashboardSummary() {
    const db = await connectDb();
    if (!db) {
        return {
            stats: [
                { label: "Users", value: "0", accent: "blue" },
                { label: "Notes", value: "0", accent: "orange" },
                { label: "Papers", value: "0", accent: "indigo" },
                { label: "Quizzes", value: "0", accent: "emerald" }
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
            { label: "Users", value: String(users), accent: "blue" },
            { label: "Notes", value: String(notes), accent: "orange" },
            { label: "Papers", value: String(papers), accent: "indigo" },
            { label: "Quizzes", value: String(quizzes), accent: "emerald" }
        ],
        notices: notices,
        progress: [
            { label: "Completed Quizzes", value: String(quizzes) },
            { label: "Downloaded Notes", value: String(notes) },
            { label: "Downloaded Papers", value: String(papers) }
        ]
    };
}
export async function loginStudent(input) {
    const db = await connectDb();
    const normalizedEmail = input.email.trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@studymaterial.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
    if (normalizedEmail === adminEmail && input.password === adminPassword) {
        return {
            mode: "admin",
            token: signToken({ userId: "admin_001", role: "admin", email: normalizedEmail }),
            user: {
                id: "admin_001",
                email: normalizedEmail,
                username: "System Admin",
                role: "admin",
                isAdmin: true,
                grade: "11th",
                stream: "Medical"
            }
        };
    }
    if (!db) {
        throw new Error("MongoDB database server not connected");
    }
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    if (!user) {
        throw new Error("No account found with this email! Please register first.");
    }
    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
        throw new Error("Incorrect password! Please check your credentials.");
    }
    const id = user._id?.toString() ?? normalizedEmail;
    const isAdmin = user.role === "admin" || user.isAdmin === true;
    return {
        mode: isAdmin ? "admin" : "db",
        token: signToken({ userId: id, role: isAdmin ? "admin" : user.role, email: user.email }),
        user: {
            id,
            email: user.email,
            username: user.username,
            role: isAdmin ? "admin" : user.role,
            isAdmin,
            grade: user.grade,
            stream: user.stream
        }
    };
}
export async function registerStudent(input) {
    const db = await connectDb();
    if (!db) {
        throw new Error("MongoDB database server not connected");
    }
    const normalizedEmail = input.email.trim().toLowerCase();
    const passwordHash = await hashPassword(input.password);
    const users = db.collection("users");
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
        throw new Error("This email is already registered! One email can only register once.");
    }
    const now = new Date();
    const result = await users.insertOne({
        username: input.username,
        email: normalizedEmail,
        passwordHash,
        role: "student",
        isAdmin: false,
        grade: input.grade,
        stream: input.stream,
        createdAt: now,
        updatedAt: now
    });
    return {
        mode: "db",
        token: signToken({ userId: result.insertedId.toString(), role: "student", email: normalizedEmail }),
        user: {
            id: result.insertedId.toString(),
            email: normalizedEmail,
            username: input.username,
            grade: input.grade,
            stream: input.stream,
            role: "student",
            isAdmin: false
        }
    };
}
export async function createResetToken(email) {
    const db = await connectDb();
    const token = crypto.randomUUID();
    if (!db)
        throw new Error("MongoDB database server not connected");
    const resets = db.collection("password_resets");
    await resets.insertOne({
        email: email.trim().toLowerCase(),
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        createdAt: new Date()
    });
    return { mode: "db", token };
}
export async function resetPassword(input) {
    const db = await connectDb();
    if (!db)
        throw new Error("MongoDB database server not connected");
    const passwordHash = await hashPassword(input.password);
    const resets = db.collection("password_resets");
    const record = await resets.findOne({ token: input.token });
    if (!record || record.expiresAt < new Date())
        throw new Error("Invalid or expired reset token");
    await db.collection("users").updateOne({ email: record.email }, { $set: { passwordHash, updatedAt: new Date() } });
    await resets.deleteMany({ email: record.email });
    return { mode: "db" };
}
function collectionName(type) {
    return {
        notes: "notes",
        papers: "previous_papers",
        videos: "videos",
        quizzes: "quizzes",
        notices: "notices",
        downloads: "downloads",
        results: "results",
        subjects: "subjects"
    }[type];
}
export async function listContent(type, filter = {}) {
    const db = await connectDb();
    if (!db)
        return [];
    const collection = collectionName(type);
    if (!collection)
        return [];
    return db.collection(collection).find(filter).sort({ createdAt: -1 }).toArray();
}
export async function createContent(type, payload) {
    const db = await connectDb();
    if (!db) {
        throw new Error("Database not configured");
    }
    const collection = collectionName(type);
    if (!collection)
        throw new Error("Invalid content type");
    const doc = {
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await db.collection(collection).insertOne(doc);
    return { insertedId: result.insertedId.toString(), ...doc };
}
export async function deleteContent(type, id) {
    const db = await connectDb();
    if (!db)
        throw new Error("Database not configured");
    const collection = collectionName(type);
    if (!collection)
        throw new Error("Invalid content type");
    let query;
    try {
        query = { _id: new ObjectId(id) };
    }
    catch {
        query = { id: id };
    }
    const result = await db.collection(collection).deleteOne(query);
    return result.deletedCount > 0;
}
export async function updateContent(type, id, payload) {
    const db = await connectDb();
    if (!db)
        throw new Error("Database not configured");
    const collection = collectionName(type);
    if (!collection)
        throw new Error("Invalid content type");
    let query;
    try {
        query = { _id: new ObjectId(id) };
    }
    catch {
        query = { id: id };
    }
    const cleanPayload = { ...payload };
    delete cleanPayload._id;
    const result = await db.collection(collection).updateOne(query, { $set: { ...cleanPayload, updatedAt: new Date() } });
    return result.modifiedCount > 0;
}
