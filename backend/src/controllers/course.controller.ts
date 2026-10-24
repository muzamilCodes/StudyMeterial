import type { Request, Response } from "express";
import { z } from "zod";
import {
  addCourseReview,
  addLessonComment,
  createAssignment,
  createCourse,
  deleteAssignment,
  deleteCourse,
  enrollCourse,
  getCourseDetail,
  homepageLessonVideos,
  instructorCourseReviews,
  instructorCourseStats,
  instructorEnrollments,
  lessonAnalytics,
  listAssignments,
  listCourseReviews,
  listCourses,
  recordLessonShare,
  recordLessonView,
  setCourseStatus,
  setLessonLike,
  studentEnrollments,
  toggleLessonComplete,
  updateCourse,
  type CourseActor
} from "../services.course.js";

const actorOf = (req: Request): CourseActor => {
  const u = (req as any).user;
  return { id: u.id, email: u.email, role: u.role, username: u.username, grade: u.grade, stream: u.stream };
};

const lessonSchema = z.object({
  title:         z.string().min(2),
  description:   z.string().default(""),
  videoUrl:      z.string().min(1),
  videoSource:   z.enum(["upload", "url"]).default("upload"),
  duration:      z.string().default("0:00"),
  allowDownload: z.boolean().default(true),
  freePreview:   z.boolean().default(false),
  resources:     z.array(z.object({ name: z.string().default("Notes"), url: z.string().min(1) })).default([]),
  existingLessonId: z.string().optional(),
  order:         z.number().int().min(0).optional()
});

const moduleSchema = z.object({
  title:   z.string().min(2),
  lessons: z.array(lessonSchema).default([])
});

const courseInputSchema = z.object({
  title:        z.string().min(2),
  thumbnail:    z.string().default(""),
  description:  z.string().min(10),
  academicLevel: z.string().optional().default("Class 10"),
  subject:      z.string().optional().default("Mathematics"),
  category:     z.string().min(1),
  grade:        z.string().default("All"),
  stream:       z.string().default("All"),
  level:        z.enum(["Beginner", "Intermediate", "Advanced"]),
  language:     z.string().min(1),
  price:        z.number().min(0),
  outcomes:     z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  modules:      z.array(moduleSchema).default([]),
  status:       z.enum(["Draft", "Pending Approval", "Published"]),
  instructorBio: z.string().optional()
});

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
const param = (value: string | string[]) => (Array.isArray(value) ? String(value[0]) : value);

export async function listCoursesHandler(req: Request, res: Response) {
  const actor = (req as any).user as CourseActor | undefined;
  return res.json(await listCourses({
    mine:          req.query.mine === "1",
    all:           req.query.all === "1",
    academicLevel: asString(req.query.academicLevel || req.query.class),
    subject:       asString(req.query.subject),
    category:      asString(req.query.category),
    level:         asString(req.query.level),
    instructorId:  asString(req.query.instructorId),
    search:        asString(req.query.search)
  }, actor));
}

export async function courseDetailHandler(req: Request, res: Response) {
  const actor = (req as any).user as CourseActor | undefined;
  const result = await getCourseDetail(param(req.params.id), actor);
  return res.status(result.status).json(result.body);
}

export async function homepageLessonVideosHandler(req: Request, res: Response) {
  const actor = (req as any).user as CourseActor | undefined;
  return res.json(await homepageLessonVideos(12, actor));
}

export async function createCourseHandler(req: Request, res: Response) {
  const parsed = courseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid course payload." });
  }
  const result = await createCourse(actorOf(req), parsed.data);
  return res.status(result.status).json(result.body);
}

export async function updateCourseHandler(req: Request, res: Response) {
  const parsed = courseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid course payload." });
  }
  const result = await updateCourse(param(req.params.id), actorOf(req), parsed.data);
  return res.status(result.status).json(result.body);
}

export async function setCourseStatusHandler(req: Request, res: Response) {
  const raw = String(req.body?.status ?? "");
  const status = raw === "Draft" || raw === "Pending Approval" ? raw : "Published";
  const result = await setCourseStatus(param(req.params.id), actorOf(req), status as "Draft" | "Pending Approval" | "Published");
  return res.status(result.status).json(result.body);
}

export async function myEnrollmentsHandler(req: Request, res: Response) {
  return res.json(await studentEnrollments(actorOf(req)));
}

export async function deleteCourseHandler(req: Request, res: Response) {
  const result = await deleteCourse(param(req.params.id), actorOf(req));
  return res.status(result.status).json(result.body);
}

export async function enrollCourseHandler(req: Request, res: Response) {
  const result = await enrollCourse(param(req.params.id), actorOf(req));
  return res.status(result.status).json(result.body);
}

export async function completeLessonHandler(req: Request, res: Response) {
  const completed = req.body?.completed !== false;
  const result = await toggleLessonComplete(param(req.params.id), param(req.params.lessonId), actorOf(req), completed);
  return res.status(result.status).json(result.body);
}

export async function listReviewsHandler(req: Request, res: Response) {
  return res.json(await listCourseReviews(param(req.params.id)));
}

export async function addReviewHandler(req: Request, res: Response) {
  const schema = z.object({
    rating:  z.number().int().min(1).max(5),
    comment: z.string().max(1000).default("")
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }
  const result = await addCourseReview(param(req.params.id), actorOf(req), parsed.data.rating, parsed.data.comment);
  return res.status(result.status).json(result.body);
}

export async function instructorStatsHandler(_req: Request, res: Response) {
  return res.json(await instructorCourseStats(actorOf(_req)));
}

export async function instructorEnrollmentsHandler(_req: Request, res: Response) {
  return res.json(await instructorEnrollments(actorOf(_req)));
}

export async function instructorReviewsHandler(_req: Request, res: Response) {
  return res.json(await instructorCourseReviews(actorOf(_req)));
}

// ─── Assignments ─────────────────────────────────────────────────────────────

export async function listAssignmentsHandler(req: Request, res: Response) {
  const actor = (req as any).user as CourseActor | undefined;
  return res.json(await listAssignments({
    mine:   req.query.mine === "1",
    grade:  asString(req.query.grade),
    stream: asString(req.query.stream)
  }, actor));
}

export async function createAssignmentHandler(req: Request, res: Response) {
  const schema = z.object({
    title:       z.string().min(2),
    description: z.string().default(""),
    subject:     z.string().min(2),
    grade:       z.enum(["10th", "11th", "12th"]),
    stream:      z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]),
    deadline:    z.string().default(""),
    marks:       z.number().int().positive().default(50)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid assignment payload." });
  const result = await createAssignment(actorOf(req), parsed.data);
  return res.status(result.status).json(result.body);
}

export async function deleteAssignmentHandler(req: Request, res: Response) {
  const result = await deleteAssignment(param(req.params.id), actorOf(req));
  return res.status(result.status).json(result.body);
}

// ─── Lesson engagement ───────────────────────────────────────────────────────

export async function lessonViewHandler(req: Request, res: Response) {
  const u = (req as any).user;
  const actor: CourseActor = u ? actorOf(req) : { id: "", email: "", role: "guest" };
  const result = await recordLessonView(param(req.params.id), param(req.params.lessonId), actor);
  return res.status(result.status).json(result.body);
}

export async function lessonShareHandler(req: Request, res: Response) {
  const result = await recordLessonShare(param(req.params.id), param(req.params.lessonId), actorOf(req));
  return res.status(result.status).json(result.body);
}

export async function lessonLikeHandler(req: Request, res: Response) {
  const liked = req.body?.liked !== false;
  const result = await setLessonLike(param(req.params.id), param(req.params.lessonId), actorOf(req), liked);
  return res.status(result.status).json(result.body);
}

export async function lessonCommentHandler(req: Request, res: Response) {
  const parsed = z.object({ text: z.string().trim().min(1, { message: "Comment cannot be empty." }).max(500) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid comment." });
  }
  const result = await addLessonComment(param(req.params.id), param(req.params.lessonId), actorOf(req), parsed.data.text);
  return res.status(result.status).json(result.body);
}

export async function lessonAnalyticsHandler(req: Request, res: Response) {
  const result = await lessonAnalytics(param(req.params.id), actorOf(req));
  return res.status(result.status).json(result.body);
}
