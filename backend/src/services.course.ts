import mongoose from "mongoose";
import { AssignmentModel, CourseModel, CourseEnrollmentModel, CourseReviewModel } from "./models/index.js";

const oid = (id: string) => new mongoose.Types.ObjectId(id);

export type CourseActor = {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
};

const isAdminRole  = (role: string) => role === "superAdmin" || role === "admin";
const canManage    = (course: any, actor: CourseActor) =>
  isAdminRole(actor.role) || course.instructorId?.toString() === actor.id;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const totalLessons = (course: any) =>
  (course.modules || []).reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0);

const actorName = (actor: CourseActor) => actor.name || actor.username || "Faculty";

async function enrollmentCounts(courseIds: string[]) {
  if (!courseIds.length) return new Map<string, number>();
  const rows = await CourseEnrollmentModel.aggregate([
    { $match: { courseId: { $in: courseIds.map((id) => oid(id)) } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } }
  ]);
  return new Map(rows.map((r: any) => [r._id.toString(), r.count]));
}


const courseCard = (course: any, enrolledCount: number) => ({
  id:            course._id.toString(),
  instructorId:  course.instructorId?.toString(),
  instructorName: course.instructorName,
  instructorEmail: course.instructorEmail,
  instructorBio: course.instructorBio,
  title:         course.title,
  thumbnail:     course.thumbnail,
  description:   course.description,
  category:      course.category,
  level:         course.level,
  language:      course.language,
  price:         course.price,
  outcomes:      course.outcomes || [],
  requirements:  course.requirements || [],
  status:        course.status,
  ratingAvg:     course.ratingAvg,
  ratingCount:   course.ratingCount,
  moduleCount:   course.modules?.length || 0,
  lessonCount:   totalLessons(course),
  enrolledCount,
  createdAt:     course.createdAt
});

export async function listCourses(filters: {
  mine?: boolean;
  all?: boolean;
  category?: string;
  level?: string;
  search?: string;
}, actor?: CourseActor) {
  const filter: any = {};

  if (filters.all && actor && isAdminRole(actor.role)) {
    // no status filter — admin sees every course
  } else if (filters.mine && actor) {
    filter.instructorId = oid(actor.id);
  } else {
    filter.status = "Published";
  }

  if (filters.category) filter.category = filters.category;
  if (filters.level)    filter.level = filters.level;
  if (filters.search) {
    const rx = new RegExp(escapeRegex(filters.search), "i");
    filter.$or = [{ title: rx }, { description: rx }, { category: rx }];
  }

  const courses = await CourseModel.find(filter).sort({ createdAt: -1 }).lean();
  const counts  = await enrollmentCounts(courses.map((c: any) => c._id.toString()));
  return { data: courses.map((c: any) => courseCard(c, counts.get(c._id.toString()) || 0)) };
}

export async function getCourseDetail(id: string, actor?: CourseActor) {
  const course: any = await CourseModel.findById(id).lean();
  if (!course) return { status: 404, body: { message: "Course not found." } };

  const manager = actor ? canManage(course, actor) : false;
  if (course.status !== "Published" && !manager) {
    return { status: 403, body: { message: "This course is not available yet." } };
  }

  let enrollment: any = null;
  if (actor?.id) {
    enrollment = await CourseEnrollmentModel.findOne({
      courseId: oid(id),
      studentId: oid(actor.id)
    }).lean();
  }

  const hasFullAccess = manager || !!enrollment;
  const lessons = (course.modules || []).map((m: any) => ({
    id: m._id.toString(),
    title: m.title,
    lessons: (m.lessons || []).map((l: any) => {
      const unlocked = hasFullAccess || l.freePreview;
      return {
        id: l._id.toString(),
        title: l.title,
        description: l.description,
        duration: l.duration,
        freePreview: !!l.freePreview,
        allowDownload: !!l.allowDownload,
        resources: unlocked ? (l.resources || []).map((r: any) => ({ name: r.name || "Notes", url: r.url })) : [],
        videoUrl: unlocked ? l.videoUrl : "",
        locked: !unlocked
      };
    })
  }));

  const total = totalLessons(course);
  const completed: string[] = enrollment?.completedLessons || [];
  const counts = await enrollmentCounts([id]);

  return {
    status: 200,
    body: {
      data: {
        ...courseCard(course, counts.get(id) || 0),
        isOwner: manager,
        viewer: {
          enrolled: !!enrollment,
          completedLessons: completed,
          progressPct: total ? Math.round((completed.length / total) * 100) : 0
        },
        modules: lessons
      }
    }
  };
}

export async function createCourse(actor: CourseActor, input: any) {
  const created: any = await CourseModel.create({
    instructorId:    oid(actor.id),
    instructorName:  actorName(actor),
    instructorEmail: actor.email,
    instructorBio:   input.instructorBio || "Faculty Educator",
    title:           input.title,
    thumbnail:       input.thumbnail || "",
    description:     input.description,
    category:        input.category,
    level:           input.level,
    language:        input.language,
    price:           input.price,
    outcomes:        input.outcomes || [],
    requirements:    input.requirements || [],
    status:          input.status,
    modules: (input.modules || []).map((m: any) => ({
      title: m.title,
      lessons: (m.lessons || []).map((l: any, idx: number) => ({
        title: l.title,
        description: l.description || "",
        videoUrl: l.videoUrl,
        videoSource: l.videoSource || "upload",
        duration: l.duration || "0:00",
        allowDownload: l.allowDownload !== false,
        freePreview: !!l.freePreview,
        order: typeof l.order === "number" ? l.order : idx,
        resources: (l.resources || []).map((r: any) => ({ name: r.name || "Notes", url: r.url }))
      }))
    }))
  });
  return { status: 201, body: { data: courseCard(created, 0) } };
}

export async function updateCourse(id: string, actor: CourseActor, input: any) {
  const course: any = await CourseModel.findById(id);
  if (!course) return { status: 404, body: { message: "Course not found." } };
  if (!canManage(course, actor)) return { status: 403, body: { message: "You can only manage your own courses." } };

  course.set({
    title:        input.title,
    thumbnail:    input.thumbnail ?? course.thumbnail,
    description:  input.description,
    category:     input.category,
    level:        input.level,
    language:     input.language,
    price:        input.price,
    outcomes:     input.outcomes ?? course.outcomes,
    requirements: input.requirements ?? course.requirements,
    status:       input.status,
    modules: (input.modules || []).map((m: any) => ({
      title: m.title,
      lessons: (m.lessons || []).map((l: any, idx: number) => ({
        title: l.title,
        description: l.description || "",
        videoUrl: l.videoUrl,
        videoSource: l.videoSource || "upload",
        duration: l.duration || "0:00",
        allowDownload: l.allowDownload !== false,
        freePreview: !!l.freePreview,
        order: typeof l.order === "number" ? l.order : idx,
        resources: (l.resources || []).map((r: any) => ({ name: r.name || "Notes", url: r.url }))
      }))
    }))
  });
  await course.save();
  const counts = await enrollmentCounts([id]);
  return { status: 200, body: { data: courseCard(course, counts.get(id) || 0) } };
}

export async function setCourseStatus(id: string, actor: CourseActor, status: "Draft" | "Published") {
  const course: any = await CourseModel.findById(id);
  if (!course) return { status: 404, body: { message: "Course not found." } };
  if (!canManage(course, actor)) return { status: 403, body: { message: "You can only manage your own courses." } };
  if (status === "Published" && totalLessons(course) === 0) {
    return { status: 400, body: { message: "Add at least one video lesson before publishing." } };
  }
  course.status = status;
  await course.save();
  const counts = await enrollmentCounts([id]);
  return { status: 200, body: { data: courseCard(course, counts.get(id) || 0) } };
}

export async function deleteCourse(id: string, actor: CourseActor) {
  const course: any = await CourseModel.findById(id);
  if (!course) return { status: 404, body: { message: "Course not found." } };
  if (!canManage(course, actor)) return { status: 403, body: { message: "You can only manage your own courses." } };
  await CourseEnrollmentModel.deleteMany({ courseId: course._id });
  await CourseReviewModel.deleteMany({ courseId: course._id });
  await CourseModel.findByIdAndDelete(course._id);
  return { status: 200, body: { message: "Course deleted." } };
}

export async function enrollCourse(id: string, actor: CourseActor) {
  const course: any = await CourseModel.findById(id).lean();
  if (!course) return { status: 404, body: { message: "Course not found." } };
  if (course.status !== "Published") return { status: 400, body: { message: "This course is not published yet." } };

  const existing = await CourseEnrollmentModel.findOne({
    courseId: oid(id),
    studentId: oid(actor.id)
  }).lean();
  if (existing) {
    return { status: 200, body: { message: "Already enrolled.", data: { id: existing._id.toString() } } };
  }
  const created: any = await CourseEnrollmentModel.create({
    courseId: oid(id),
    studentId: oid(actor.id),
    studentName: actorName(actor),
    email: actor.email
  });
  return { status: 201, body: { message: "Enrolled successfully.", data: { id: created._id.toString() } } };
}

export async function toggleLessonComplete(courseId: string, lessonId: string, actor: CourseActor, completed: boolean) {
  const enrollment: any = await CourseEnrollmentModel.findOne({
    courseId: oid(courseId),
    studentId: oid(actor.id)
  });
  if (!enrollment) return { status: 403, body: { message: "Enroll in the course to track progress." } };

  const course: any = await CourseModel.findById(courseId).lean();
  if (!course) return { status: 404, body: { message: "Course not found." } };

  const exists = (course.modules || []).some((m: any) => (m.lessons || []).some((l: any) => l._id.toString() === lessonId));
  if (!exists) return { status: 404, body: { message: "Lesson not found in this course." } };

  const set = new Set(enrollment.completedLessons as string[]);
  if (completed) set.add(lessonId); else set.delete(lessonId);
  enrollment.completedLessons = [...set];
  await enrollment.save();

  const total = totalLessons(course);
  return {
    status: 200,
    body: {
      data: {
        completedLessons: enrollment.completedLessons,
        progressPct: total ? Math.round((enrollment.completedLessons.length / total) * 100) : 0
      }
    }
  };
}

export async function listCourseReviews(courseId: string) {
  const reviews = await CourseReviewModel.find({ courseId: oid(courseId) })
    .sort({ createdAt: -1 })
    .lean();
  return {
    data: reviews.map((r: any) => ({
      id: r._id.toString(),
      studentName: r.studentName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }))
  };
}

export async function addCourseReview(courseId: string, actor: CourseActor, rating: number, comment: string) {
  const enrolled = await CourseEnrollmentModel.exists({
    courseId: oid(courseId),
    studentId: oid(actor.id)
  });
  if (!enrolled) return { status: 403, body: { message: "Only enrolled students can review this course." } };

  await CourseReviewModel.findOneAndUpdate(
    { courseId: oid(courseId), studentId: oid(actor.id) },
    { courseId: oid(courseId), studentId: oid(actor.id), studentName: actorName(actor), rating, comment },
    { upsert: true, new: true }
  );

  const agg: any = await CourseReviewModel.aggregate([
    { $match: { courseId: oid(courseId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  await CourseModel.findByIdAndUpdate(courseId, {
    ratingAvg: agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0,
    ratingCount: agg[0]?.count || 0
  });

  return { status: 201, body: await listCourseReviews(courseId) };
}

export async function instructorCourseStats(actor: CourseActor) {
  const courses: any[] = await CourseModel.find({ instructorId: oid(actor.id) }).lean();
  const ids = courses.map((c) => c._id.toString());
  const counts = await enrollmentCounts(ids);

  let students = 0;
  let earnings = 0;
  for (const c of courses) {
    const enrolled = counts.get(c._id.toString()) || 0;
    students += enrolled;
    earnings += enrolled * (c.price || 0);
  }

  return {
    data: {
      courses: courses.length,
      published: courses.filter((c) => c.status === "Published").length,
      drafts: courses.filter((c) => c.status === "Draft").length,
      videoLessons: courses.reduce((n, c) => n + totalLessons(c), 0),
      students,
      earnings,
      ratings: courses.reduce((n, c) => n + (c.ratingCount || 0), 0)
    }
  };
}

export async function instructorEnrollments(actor: CourseActor) {
  const courses: any[] = await CourseModel.find({ instructorId: oid(actor.id) }).lean();
  const courseById = new Map(courses.map((c) => [c._id.toString(), c]));
  const enrollments = await CourseEnrollmentModel.find({
    courseId: { $in: courses.map((c) => c._id) }
  }).sort({ createdAt: -1 }).lean();

  return {
    data: enrollments.map((e: any) => {
      const course = courseById.get(e.courseId.toString());
      const total = course ? totalLessons(course) : 0;
      return {
        id: e._id.toString(),
        courseTitle: course?.title || "—",
        courseId: e.courseId.toString(),
        studentName: e.studentName,
        email: e.email,
        completed: e.completedLessons?.length || 0,
        totalLessons: total,
        progressPct: total ? Math.round(((e.completedLessons?.length || 0) / total) * 100) : 0,
        enrolledAt: e.createdAt
      };
    })
  };
}

export async function instructorCourseReviews(actor: CourseActor) {
  const courses: any[] = await CourseModel.find({ instructorId: oid(actor.id) }).lean();
  const reviews = await CourseReviewModel.find({
    courseId: { $in: courses.map((c) => c._id) }
  }).sort({ createdAt: -1 }).lean();
  const courseById = new Map(courses.map((c) => [c._id.toString(), c.title]));
  return {
    data: reviews.map((r: any) => ({
      id: r._id.toString(),
      courseTitle: courseById.get(r.courseId.toString()) || "—",
      studentName: r.studentName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }))
  };
}

// ─── Assignments (DB-backed, visible to students) ───────────────────────────

export async function listAssignments(filters: { grade?: string; stream?: string; mine?: boolean }, actor?: CourseActor) {
  const filter: any = {};
  if (filters.mine && actor && !isAdminRole(actor.role)) filter.instructorId = oid(actor.id);
  if (filters.grade)  filter.grade = filters.grade;
  if (filters.stream) filter.stream = filters.stream;
  const rows = await AssignmentModel.find(filter).sort({ createdAt: -1 }).lean();
  return {
    data: rows.map((a: any) => ({
      id: a._id.toString(),
      title: a.title,
      description: a.description,
      subject: a.subject,
      grade: a.grade,
      stream: a.stream,
      deadline: a.deadline,
      marks: a.marks,
      instructorName: a.instructorName,
      createdAt: a.createdAt
    }))
  };
}

export async function createAssignment(actor: CourseActor, input: {
  title: string; description: string; subject: string; grade: string; stream: string; deadline: string; marks: number;
}) {
  const created: any = await AssignmentModel.create({
    ...input,
    instructorId: oid(actor.id),
    instructorName: actorName(actor)
  } as any);
  return { status: 201, body: { data: { id: created._id.toString() } } };
}

export async function deleteAssignment(id: string, actor: CourseActor) {
  const row: any = await AssignmentModel.findById(id);
  if (!row) return { status: 404, body: { message: "Assignment not found." } };
  if (!isAdminRole(actor.role) && row.instructorId?.toString() !== actor.id) {
    return { status: 403, body: { message: "You can only delete your own assignments." } };
  }
  await AssignmentModel.findByIdAndDelete(row._id);
  return { status: 200, body: { message: "Assignment deleted." } };
}
