import type { Request, Response } from "express";
import { z } from "zod";
import {
  addCourseReview,
  createAssignment,
  createCourse,
  deleteAssignment,
  deleteCourse,
  enrollCourse,
  getCourseDetail,
  instructorCourseReviews,
  instructorCourseStats,
  instructorEnrollments,
  listAssignments,
  listCourseReviews,
  listCourses,
  setCourseStatus,
  toggleLessonComplete,
  updateCourse,
  type CourseActor
} from "../services.course.js";

const actorOf = (req: Request): CourseActor => {
  const u = (req as any).user;
  return { id: u.id, email: u.email, role: u.role, username: u.username };
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
  category:     z.string().min(2),
  level:        z.enum(["Beginner", "Intermediate", "Advanced"]),
  language:     z.string().min(1),
  price:        z.number().min(0),
  outcomes:     z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  modules:      z.array(moduleSchema).default([]),
  status:       z.enum(["Draft", "Published"]),
  instructorBio: z.string().optional()
});

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
const param = (value: string | string[]) => (Array.isArray(value) ? String(value[0]) : value);

export async function listCoursesHandler(req: Request, res: Response) {
  const actor = (req as any).user as CourseActor | undefined;
  return res.json(await listCourses({
    mine:     req.query.mine === "1",
    all:      req.query.all === "1",
    category: asString(req.query.category),
    level:    asString(req.query.level),
    search:   asString(req.query.search)
  }, actor));
}

export async function courseDetailHandler(req: Request, res: Response) {
  const actor = (req as any).user as CourseActor | undefined;
  const result = await getCourseDetail(param(req.params.id), actor);
  return res.status(result.status).json(result.body);
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
  const status = req.body?.status === "Draft" ? "Draft" : "Published";
  const result = await setCourseStatus(param(req.params.id), actorOf(req), status);
  return res.status(result.status).json(result.body);
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
