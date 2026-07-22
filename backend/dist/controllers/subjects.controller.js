import { z } from "zod";
import { createContent } from "../services.js";
import { connectDb } from "../db.js";
const gradeSchema = z.enum(["10th", "11th", "12th"]);
const streamSchema = z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]);
export async function listClasses(_req, res) {
    res.json({
        data: {
            "10th": { label: "10th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
            "11th": { label: "11th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
            "12th": { label: "12th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] }
        }
    });
}
export async function listSubjects(req, res) {
    const grade = req.query.grade;
    const stream = req.query.stream;
    const db = await connectDb();
    if (!db)
        return res.status(500).json({ message: "Database not active" });
    const filter = {};
    if (gradeSchema.safeParse(grade).success)
        filter.grade = grade;
    if (streamSchema.safeParse(stream).success)
        filter.stream = stream;
    const data = await db.collection("subjects").find(filter).toArray();
    res.json({ data });
}
export async function createSubject(req, res) {
    const schema = z.object({
        grade: gradeSchema,
        stream: streamSchema,
        name: z.string().min(2),
        description: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid subject payload: " + parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")
        });
    }
    try {
        const doc = {
            grade: parsed.data.grade,
            stream: parsed.data.stream,
            name: parsed.data.name,
            description: parsed.data.description ?? "Syllabus Course",
            notesCount: 0,
            papersCount: 0,
            videosCount: 0,
            quizzesCount: 0
        };
        const finalResult = await createContent("subjects", doc);
        res.status(201).json({ message: "Subject created", data: finalResult });
    }
    catch (err) {
        console.error("Subject creation error:", err);
        res.status(500).json({ message: "Failed to create subject" });
    }
}
