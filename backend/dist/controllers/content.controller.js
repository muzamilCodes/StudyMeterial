import { z } from "zod";
import { createContent, listContent } from "../services.js";
import fs from "fs";
import path from "path";
const gradeSchema = z.enum(["10th", "11th", "12th"]);
const streamSchema = z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]);
function getQueryFilters(req) {
    const grade = gradeSchema.safeParse(req.query.grade).success ? req.query.grade : undefined;
    const stream = streamSchema.safeParse(req.query.stream).success ? req.query.stream : undefined;
    const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;
    return { grade, stream, subject };
}
export async function listNotes(req, res) {
    const { grade, stream, subject } = getQueryFilters(req);
    const data = await listContent("notes", {
        ...(grade ? { grade } : {}),
        ...(stream ? { stream } : {}),
        ...(subject ? { subject } : {})
    });
    res.json({ data });
}
export async function createNote(req, res) {
    const schema = z.object({
        grade: gradeSchema,
        stream: streamSchema,
        subject: z.string().min(2),
        title: z.string().min(2),
        fileUrl: z.string(),
        uploadDate: z.string().optional(),
        fileSize: z.string().optional(),
        pages: z.number().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid note payload: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
        });
    }
    const result = await createContent("notes", parsed.data);
    res.status(201).json({ message: "Note created", data: result });
}
export async function listPapers(req, res) {
    const { grade, stream, subject } = getQueryFilters(req);
    const data = await listContent("papers", {
        ...(grade ? { grade } : {}),
        ...(stream ? { stream } : {}),
        ...(subject ? { subject } : {})
    });
    res.json({ data });
}
export async function createPaper(req, res) {
    const schema = z.object({
        grade: gradeSchema,
        stream: streamSchema,
        subject: z.string().min(2),
        title: z.string().min(2),
        year: z.string().min(2),
        fileUrl: z.string(),
        fileSize: z.string().optional(),
        term: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid paper payload: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
        });
    }
    const result = await createContent("papers", parsed.data);
    res.status(201).json({ message: "Paper created", data: result });
}
export async function listVideos(req, res) {
    const { grade, stream, subject } = getQueryFilters(req);
    const data = await listContent("videos", {
        ...(grade ? { grade } : {}),
        ...(stream ? { stream } : {}),
        ...(subject ? { subject } : {})
    });
    res.json({ data });
}
export async function createVideo(req, res) {
    const schema = z.object({
        grade: gradeSchema,
        stream: streamSchema,
        subject: z.string().min(2),
        title: z.string().min(2),
        videoUrl: z.string().url(),
        instructor: z.string().optional(),
        duration: z.string().optional(),
        thumbnail: z.string().url().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid video payload: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
        });
    }
    const result = await createContent("videos", parsed.data);
    res.status(201).json({ message: "Video created", data: result });
}
export async function listQuizzes(req, res) {
    const { grade, stream, subject } = getQueryFilters(req);
    const data = await listContent("quizzes", {
        ...(grade ? { grade } : {}),
        ...(stream ? { stream } : {}),
        ...(subject ? { subject } : {})
    });
    res.json({ data });
}
export async function createQuiz(req, res) {
    const schema = z.object({
        grade: gradeSchema,
        stream: streamSchema,
        subject: z.string().min(2),
        topic: z.string().min(2),
        title: z.string().min(2),
        durationMinutes: z.number().int().positive(),
        totalQuestions: z.number().int().positive().optional(),
        questions: z.array(z.object({
            id: z.number().int().positive().optional(),
            question: z.string().min(2),
            options: z.array(z.string().min(1)).min(2),
            correctIndex: z.number().int().nonnegative(),
            explanation: z.string().optional()
        }))
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid quiz payload: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
        });
    }
    const doc = {
        ...parsed.data,
        totalQuestions: parsed.data.totalQuestions ?? parsed.data.questions.length
    };
    const result = await createContent("quizzes", doc);
    res.status(201).json({ message: "Quiz created", data: result });
}
export async function listNotices(_req, res) {
    const data = await listContent("notices");
    res.json({ data });
}
export async function createNotice(req, res) {
    const schema = z.object({
        title: z.string().min(2),
        body: z.string().min(2),
        category: z.string().min(2)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid notice payload: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
        });
    }
    const result = await createContent("notices", parsed.data);
    res.status(201).json({ message: "Notice created", data: result });
}
export async function listDownloads(req, res) {
    const data = await listContent("downloads", req.query.grade ? { grade: req.query.grade } : {});
    res.json({ data });
}
export async function listResults(req, res) {
    const data = await listContent("results", req.query.grade ? { grade: req.query.grade } : {});
    res.json({ data });
}
export async function listProgress(req, res) {
    const [notes, papers, quizzes] = await Promise.all([
        listContent("notes", req.query.grade ? { grade: req.query.grade } : {}),
        listContent("papers", req.query.grade ? { grade: req.query.grade } : {}),
        listContent("quizzes", req.query.grade ? { grade: req.query.grade } : {})
    ]);
    res.json({
        data: {
            completedQuizzes: quizzes.length,
            downloadedNotes: notes.length,
            downloadedPapers: papers.length
        }
    });
}
export async function uploadFile(req, res) {
    const schema = z.object({
        filename: z.string().min(1),
        base64: z.string().min(10)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid upload payload" });
    }
    try {
        const base64Data = parsed.data.base64.split(",")[1] ?? parsed.data.base64;
        const buffer = Buffer.from(base64Data, "base64");
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const uniqueFilename = `${Date.now()}-${parsed.data.filename.replace(/\s+/g, "_")}`;
        const filePath = path.join(uploadsDir, uniqueFilename);
        await fs.promises.writeFile(filePath, buffer);
        const fileUrl = `/uploads/${uniqueFilename}`;
        res.status(200).json({
            message: "File uploaded successfully",
            fileUrl
        });
    }
    catch (err) {
        console.error("File upload error:", err);
        res.status(500).json({ message: "Failed to save file on server" });
    }
}
