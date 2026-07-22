import { z } from "zod";
import { createContent, listContent, deleteContent } from "../services.js";
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
        fileUrl: z.string().url(),
        fileSize: z.string().optional(),
        pages: z.number().int().optional(),
        uploadDate: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid note payload" });
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
        term: z.string().optional(),
        fileSize: z.string().optional(),
        fileUrl: z.string().url()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid paper payload" });
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
        instructor: z.string().optional(),
        duration: z.string().optional(),
        thumbnail: z.string().optional(),
        videoUrl: z.string().url()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid video payload" });
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
        title: z.string().min(2),
        durationMinutes: z.number().int().positive(),
        questions: z.array(z.object({
            question: z.string().min(2),
            options: z.array(z.string().min(1)).min(2),
            answer: z.string().min(1)
        }))
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid quiz payload" });
    const result = await createContent("quizzes", parsed.data);
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
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid notice payload" });
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
export async function deleteNote(req, res) {
    try {
        const id = req.params.id;
        const ok = await deleteContent("notes", id);
        if (!ok)
            return res.status(404).json({ message: "Note not found" });
        res.json({ message: "Note deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting note" });
    }
}
export async function deletePaper(req, res) {
    try {
        const id = req.params.id;
        const ok = await deleteContent("papers", id);
        if (!ok)
            return res.status(404).json({ message: "Paper not found" });
        res.json({ message: "Paper deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting paper" });
    }
}
export async function deleteVideo(req, res) {
    try {
        const id = req.params.id;
        const ok = await deleteContent("videos", id);
        if (!ok)
            return res.status(404).json({ message: "Video not found" });
        res.json({ message: "Video deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting video" });
    }
}
