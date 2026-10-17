import type { Request, Response } from "express";
import { z } from "zod";
import {
  contentServices,
  createLiveClass,
  deleteLiveClass,
  listLiveClasses,
  publishLiveClass,
  updateLiveClass,
  normalizeGrade,
  normalizeStream
} from "../services.js";

const gradeSchema  = z.enum(["10th", "11th", "12th"]).optional();
const streamSchema = z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]).optional();

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
const asId     = (value: unknown) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value))     return value[0] ?? "";
  return "";
};

function pickFilters(req: Request) {
  return {
    grade:       normalizeGrade(asString(req.query.grade)),
    stream:      normalizeStream(asString(req.query.stream)),
    subject:     asString(req.query.subject),
    status:      asString(req.query.status),
    category:    asString(req.query.category),
    teacherName: asString(req.query.teacherName),
    search:      asString(req.query.search)
  };
}

// ─── Live Classes ────────────────────────────────────────────────────────────

export async function listLiveClassesHandler(req: Request, res: Response) {
  return res.json(await listLiveClasses(pickFilters(req)));
}

export async function createLiveClassHandler(req: Request, res: Response) {
  const schema = z.object({
    title:                 z.string().min(2),
    subject:               z.string().min(2),
    category:              z.string().min(2),
    description:           z.string().min(1),
    teacherName:           z.string().min(2),
    teacherPhoto:          z.string().url().optional(),
    teacherBio:            z.string().optional(),
    date:                  z.string().min(1),
    startTime:             z.string().min(1),
    endTime:               z.string().min(1),
    duration:              z.string().min(1),
    timeZone:              z.string().optional(),
    meetingPlatform:       z.enum(["Google Meet", "Zoom", "Jitsi", "LiveKit", "Custom"]),
    meetingLink:           z.string().url(),
    meetingId:             z.string().optional(),
    meetingPassword:       z.string().optional(),
    maxStudents:           z.number().int().positive(),
    enrolledStudentsCount: z.number().int().nonnegative().optional(),
    language:              z.string().min(1),
    difficultyLevel:       z.enum(["Beginner", "Intermediate", "Advanced"]),
    bannerUrl:             z.string().url().optional(),
    thumbnailUrl:          z.string().url().optional(),
    tags:                  z.array(z.string()).optional(),
    status:                z.enum(["Draft", "Published", "Upcoming", "Starting Soon", "Live", "Completed", "Recording Available", "Archived"]),
    allowRecording:        z.boolean(),
    allowChat:             z.boolean(),
    allowScreenShare:      z.boolean(),
    allowStudentQuestions: z.boolean(),
    attachments:           z.array(z.object({ title: z.string(), type: z.string(), url: z.string(), size: z.string().optional() })).optional(),
    prerequisites:         z.array(z.string()).optional(),
    learningOutcomes:      z.array(z.string()).optional(),
    recordingUrl:          z.string().url().optional(),
    homeworkUrl:           z.string().url().optional(),
    grade:                 gradeSchema,
    stream:                streamSchema
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success || !parsed.data.grade || !parsed.data.stream) {
    return res.status(400).json({ message: "Invalid live class payload" });
  }

  return res.status(201).json(await createLiveClass(parsed.data));
}

export async function updateLiveClassHandler(req: Request, res: Response) {
  const item = await updateLiveClass(asId(req.params.id), req.body ?? {});
  if (!item) return res.status(404).json({ message: "Live class not found" });
  return res.json({ data: item });
}

export async function deleteLiveClassHandler(req: Request, res: Response) {
  const removed = await deleteLiveClass(asId(req.params.id));
  if (!removed) return res.status(404).json({ message: "Live class not found" });
  return res.json({ message: "Live class deleted", data: removed });
}

export async function publishLiveClassHandler(req: Request, res: Response) {
  const result = await publishLiveClass(asId(req.params.id));
  if (!result) return res.status(404).json({ message: "Live class not found" });
  return res.json({ message: "Live class published", data: result.item, notice: result.notice });
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function listNotesHandler(req: Request, res: Response) {
  return res.json(await contentServices.listNotes({
    grade:   normalizeGrade(asString(req.query.grade)),
    stream:  normalizeStream(asString(req.query.stream)),
    subject: asString(req.query.subject),
    search:  asString(req.query.search)
  }));
}

export async function createNoteHandler(req: Request, res: Response) {
  const schema = z.object({
    subject:    z.string().min(2),
    title:      z.string().min(2),
    grade:      z.enum(["10th", "11th", "12th"]),
    stream:     z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]),
    uploadDate: z.string().optional(),
    fileSize:   z.string().min(1),
    pages:      z.number().int().positive(),
    fileUrl:    z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid note payload" });
  return res.status(201).json(await contentServices.createNote(parsed.data));
}

export async function deleteNoteHandler(req: Request, res: Response) {
  const removed = await contentServices.deleteNote(asId(req.params.id));
  if (!removed) return res.status(404).json({ message: "Note not found" });
  return res.json({ message: "Note deleted", data: removed });
}

// ─── Papers ──────────────────────────────────────────────────────────────────

export async function listPapersHandler(req: Request, res: Response) {
  return res.json(await contentServices.listPapers({
    grade:   normalizeGrade(asString(req.query.grade)),
    stream:  normalizeStream(asString(req.query.stream)),
    subject: asString(req.query.subject),
    search:  asString(req.query.search)
  }));
}

export async function createPaperHandler(req: Request, res: Response) {
  const schema = z.object({
    subject:  z.string().min(2),
    title:    z.string().min(2),
    year:     z.string().min(1),
    term:     z.string().min(1),
    grade:    z.enum(["10th", "11th", "12th"]),
    stream:   z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]),
    fileSize: z.string().min(1),
    fileUrl:  z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid paper payload" });
  return res.status(201).json(await contentServices.createPaper(parsed.data));
}

export async function deletePaperHandler(req: Request, res: Response) {
  const removed = await contentServices.deletePaper(asId(req.params.id));
  if (!removed) return res.status(404).json({ message: "Paper not found" });
  return res.json({ message: "Paper deleted", data: removed });
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export async function listVideosHandler(req: Request, res: Response) {
  return res.json(await contentServices.listVideos({
    grade:   normalizeGrade(asString(req.query.grade)),
    stream:  normalizeStream(asString(req.query.stream)),
    subject: asString(req.query.subject),
    search:  asString(req.query.search)
  }));
}

export async function createVideoHandler(req: Request, res: Response) {
  const schema = z.object({
    subject:    z.string().min(2),
    title:      z.string().min(2),
    instructor: z.string().min(2),
    duration:   z.string().min(1),
    grade:      z.enum(["10th", "11th", "12th"]),
    stream:     z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]),
    thumbnail:  z.string().min(1),
    videoUrl:   z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid video payload" });
  return res.status(201).json(await contentServices.createVideo(parsed.data));
}

export async function deleteVideoHandler(req: Request, res: Response) {
  const removed = await contentServices.deleteVideo(asId(req.params.id));
  if (!removed) return res.status(404).json({ message: "Video not found" });
  return res.json({ message: "Video deleted", data: removed });
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────

export async function listQuizzesHandler(req: Request, res: Response) {
  return res.json(await contentServices.listQuizzes({
    grade:   normalizeGrade(asString(req.query.grade)),
    stream:  normalizeStream(asString(req.query.stream)),
    subject: asString(req.query.subject),
    search:  asString(req.query.search)
  }));
}

export async function createQuizHandler(req: Request, res: Response) {
  const schema = z.object({
    subject:         z.string().min(2),
    topic:           z.string().min(2).optional(),
    title:           z.string().min(2),
    grade:           z.enum(["10th", "11th", "12th"]),
    stream:          z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]),
    durationMinutes: z.number().int().positive(),
    questions:       z.array(
      z.object({
        question: z.string().min(1),
        options:  z.array(z.string().min(1)).min(2),
        answer:   z.string().min(1)
      })
    ).min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid quiz payload" });
  return res.status(201).json(await contentServices.createQuiz(parsed.data));
}

// ─── Notices ─────────────────────────────────────────────────────────────────

export async function listNoticesHandler(_req: Request, res: Response) {
  return res.json(await contentServices.listNotices());
}

export async function createNoticeHandler(req: Request, res: Response) {
  const schema = z.object({
    title:    z.string().min(2),
    body:     z.string().min(1),
    category: z.string().min(1),
    date:     z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid notice payload" });
  return res.status(201).json(await contentServices.createNotice(parsed.data));
}

// ─── Upload & Attendance ─────────────────────────────────────────────────────

export function uploadHandler(req: Request, res: Response) {
  const file   = req.file;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const result = contentServices.uploadFile(file as any, baseUrl);
  if (!result) return res.status(400).json({ message: "No file uploaded" });
  return res.status(201).json(result);
}

export async function attendanceHandler(req: Request, res: Response) {
  const schema = z.object({
    classId:     z.string().min(1),
    studentName: z.string().min(1),
    email:       z.string().email(),
    joinTime:    z.string().min(1),
    status:      z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid attendance payload" });
  return res.status(201).json(await contentServices.attendance(parsed.data));
}

export async function listAttendanceHandler(_req: Request, res: Response) {
  return res.json(await contentServices.listAttendance());
}
