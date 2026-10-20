import mongoose from "mongoose";
import { AssignmentModel, CourseModel, CourseEnrollmentModel, CourseReviewModel } from "./models/index.js";

const oid = (id: string) => new mongoose.Types.ObjectId(id);

export type CourseActor = {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
  grade?: string;
  stream?: string;
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
  grade:         course.grade || "All",
  stream:        course.stream || "All",
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

  // Students only see courses of their own class (grade + stream).
  // Courses marked "All" (or legacy ones without a class) stay visible to everyone.
  if (actor?.role === "student" && actor.grade) {
    filter.$and = [
      { $or: [{ grade: actor.grade }, { grade: "All" }, { grade: null }] },
      { $or: [{ stream: actor.stream }, { stream: "All" }, { stream: null }] }
    ];
  }

  const courses = await CourseModel.find(filter).sort({ createdAt: -1 }).lean();
  const counts  = await enrollmentCounts(courses.map((c: any) => c._id.toString()));
  return { data: courses.map((c: any) => courseCard(c, counts.get(c._id.toString()) || 0)) };
}

// Public feed of video lessons from Published courses for the homepage.
// Free-preview lessons expose their real video URL; locked lessons are shown
// with an empty URL so the homepage can display them without leaking content.
// Students only see lessons from courses of their own class (grade + stream).
export async function homepageLessonVideos(limit = 12, actor?: CourseActor) {
  const filter: any = { status: "Published" };
  if (actor?.role === "student" && actor.grade) {
    filter.$and = [
      { $or: [{ grade: actor.grade }, { grade: "All" }, { grade: null }] },
      { $or: [{ stream: actor.stream }, { stream: "All" }, { stream: null }] }
    ];
  }
  const courses: any[] = await CourseModel.find(filter).sort({ createdAt: -1 }).lean();
  const out: any[] = [];
  for (const c of courses) {
    for (const m of (c.modules || [])) {
      for (const l of (m.lessons || [])) {
        if (!l.videoUrl) continue;
        out.push({
          lessonId:      l._id.toString(),
          courseId:      c._id.toString(),
          courseTitle:   c.title,
          title:         l.title,
          description:   l.description || "",
          thumbnail:     c.thumbnail || "",
          videoUrl:      l.freePreview ? l.videoUrl : "",
          freePreview:   !!l.freePreview,
          duration:      l.duration || "0:00",
          views:         l.views || 0,
          likeCount:     (l.likes || []).length,
          instructorName: c.instructorName,
          category:      c.category,
          level:         c.level,
          grade:         c.grade || "All",
          stream:        c.stream || "All"
        });
      }
    }
  }
  out.sort((a, b) => (Number(b.freePreview) - Number(a.freePreview)) || (b.views - a.views));
  return { data: out.slice(0, limit) };
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
        locked: !unlocked,
        views: l.views || 0,
        shares: l.shares || 0,
        likeCount: (l.likes || []).length,
        likedByViewer: !!(actor && (l.likes || []).some((k: any) => k.studentId?.toString() === actor.id)),
        comments: (l.comments || []).slice(-50).map((c: any) => ({
          id: c._id?.toString() || "",
          name: c.name || "Student",
          text: c.text,
          createdAt: c.createdAt
        }))
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
    grade:           input.grade || "All",
    stream:          input.stream || "All",
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

  // Preserve engagement data (views/likes/shares/comments) for lessons carried over by id.
  const legacyEngagement = new Map<string, any>();
  for (const m of course.modules || []) {
    for (const l of m.lessons || []) {
      legacyEngagement.set(l._id.toString(), {
        views: l.views || 0,
        shares: l.shares || 0,
        likes: (l.likes || []).map((k: any) => ({ studentId: k.studentId, name: k.name })),
        comments: (l.comments || []).map((c: any) => ({ studentId: c.studentId, name: c.name, text: c.text, createdAt: c.createdAt }))
      });
    }
  }

  course.set({
    title:        input.title,
    thumbnail:    input.thumbnail ?? course.thumbnail,
    description:  input.description,
    category:     input.category,
    grade:        input.grade || course.grade || "All",
    stream:       input.stream || course.stream || "All",
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
        resources: (l.resources || []).map((r: any) => ({ name: r.name || "Notes", url: r.url })),
        ...(l.existingLessonId && legacyEngagement.has(l.existingLessonId)
          ? legacyEngagement.get(l.existingLessonId)
          : { views: 0, shares: 0, likes: [], comments: [] })
      }))
    }))
  });
  await course.save();
  const counts = await enrollmentCounts([id]);
  return { status: 200, body: { data: courseCard(course, counts.get(id) || 0) } };
}

export async function setCourseStatus(id: string, actor: CourseActor, status: "Draft" | "Pending Approval" | "Published") {
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

  // A course belongs to one class — only students of that class may enroll
  // (courses marked "All" are open to every class).
  if (actor.role === "student" && actor.grade) {
    const gradeOk  = !course.grade || course.grade === "All" || course.grade === actor.grade;
    const streamOk = !course.stream || course.stream === "All" || course.stream === actor.stream;
    if (!gradeOk || !streamOk) {
      const cls = [course.grade !== "All" ? course.grade : null, course.stream !== "All" ? course.stream : null].filter(Boolean).join(" · ") || "another class";
      return { status: 403, body: { message: `This course is for class ${cls}. It is not available for your class.` } };
    }
  }

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

export async function studentEnrollments(actor: CourseActor) {
  const enrollments: any[] = await CourseEnrollmentModel.find({ studentId: oid(actor.id) })
    .sort({ createdAt: -1 })
    .lean();
  if (!enrollments.length) return { data: [] };

  const courses: any[] = await CourseModel.find({ _id: { $in: enrollments.map((e) => e.courseId) } }).lean();
  const courseById = new Map(courses.map((c) => [c._id.toString(), c]));

  return {
    data: enrollments.map((e) => {
      const course = courseById.get(e.courseId.toString());
      const total = course ? totalLessons(course) : 0;
      const completed: string[] = e.completedLessons || [];
      const progressPct = total ? Math.round((completed.length / total) * 100) : 0;

      let lastWatchedTitle = "";
      if (course && e.lastWatchedLesson) {
        for (const m of course.modules || []) {
          const hit = (m.lessons || []).find((l: any) => l._id.toString() === e.lastWatchedLesson);
          if (hit) { lastWatchedTitle = hit.title; break; }
        }
      }
      // Resume target: last watched lesson, else first not-completed lesson.
      let resumeLessonId = e.lastWatchedLesson || "";
      if (!resumeLessonId && course) {
        outer: for (const m of course.modules || []) {
          for (const l of m.lessons || []) {
            if (!completed.includes(l._id.toString())) { resumeLessonId = l._id.toString(); break outer; }
          }
        }
      }

      return {
        id: e._id.toString(),
        courseId: e.courseId.toString(),
        courseTitle: course?.title || "—",
        thumbnail: course?.thumbnail || "",
        instructorName: course?.instructorName || "",
        category: course?.category || "",
        grade: course?.grade || "All",
        stream: course?.stream || "All",
        courseStatus: course?.status || "Published",
        completedLessons: completed.length,
        totalLessons: total,
        progressPct,
        lastWatchedLesson: e.lastWatchedLesson || "",
        lastWatchedTitle,
        resumeLessonId,
        enrolledAt: e.createdAt
      };
    })
  };
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

// ─── Lesson engagement: views, likes, shares, comments ───────────────────────

type LessonRef = { course: any; lesson: any };

async function findLesson(courseId: string, lessonId: string): Promise<LessonRef | null> {
  const course = await CourseModel.findById(courseId);
  if (!course) return null;
  for (const m of course.modules || []) {
    const lesson = (m.lessons as any[]).find((l) => l._id.toString() === lessonId);
    if (lesson) return { course, lesson };
  }
  return null;
}

function courseAccessibleNow(ref: LessonRef, actor: CourseActor) {
  return canManage(ref.course, actor) || !!ref.lesson.freePreview;
}

type LessonAccess =
  | { kind: "error"; status: number; body: { message: string } }
  | { kind: "ok"; ref: LessonRef };

async function requireLessonAccess(courseId: string, lessonId: string, actor: CourseActor): Promise<LessonAccess> {
  const ref = await findLesson(courseId, lessonId);
  if (!ref) return { kind: "error", status: 404, body: { message: "Lesson not found in this course." } };
  const open = courseAccessibleNow(ref, actor) ||
    !!(actor.id && (await CourseEnrollmentModel.exists({ courseId: ref.course._id, studentId: oid(actor.id) })));
  if (!open) return { kind: "error", status: 403, body: { message: "Enroll in the course to interact with this lesson." } };
  return { kind: "ok", ref };
}

export async function recordLessonView(courseId: string, lessonId: string, actor: CourseActor) {
  const check = await requireLessonAccess(courseId, lessonId, actor);
  if (check.kind === "error") return { status: check.status, body: check.body };
  check.ref.lesson.views = (check.ref.lesson.views || 0) + 1;
  await check.ref.course.save();
  if (!actor.id) return { status: 200, body: { data: { views: check.ref.lesson.views } } };
  const enrollment: any = await CourseEnrollmentModel.findOne({
    courseId: oid(courseId),
    studentId: oid(actor.id)
  });
  if (enrollment && enrollment.lastWatchedLesson !== lessonId) {
    enrollment.lastWatchedLesson = lessonId;
    await enrollment.save();
  }
  return { status: 200, body: { data: { views: check.ref.lesson.views } } };
}

export async function recordLessonShare(courseId: string, lessonId: string, actor: CourseActor) {
  const check = await requireLessonAccess(courseId, lessonId, actor);
  if (check.kind === "error") return { status: check.status, body: check.body };
  check.ref.lesson.shares = (check.ref.lesson.shares || 0) + 1;
  await check.ref.course.save();
  return { status: 200, body: { data: { shares: check.ref.lesson.shares } } };
}

export async function setLessonLike(courseId: string, lessonId: string, actor: CourseActor, liked: boolean) {
  const check = await requireLessonAccess(courseId, lessonId, actor);
  if (check.kind === "error") return { status: check.status, body: check.body };
  const likes = check.ref.lesson.likes as any[];
  const idx = likes.findIndex((k: any) => k.studentId?.toString() === actor.id);
  if (liked && idx === -1) likes.push({ studentId: oid(actor.id), name: actorName(actor) });
  if (!liked && idx >= 0) likes.splice(idx, 1);
  await check.ref.course.save();
  return { status: 200, body: { data: { liked, likeCount: likes.length } } };
}

export async function addLessonComment(courseId: string, lessonId: string, actor: CourseActor, text: string) {
  const check = await requireLessonAccess(courseId, lessonId, actor);
  if (check.kind === "error") return { status: check.status, body: check.body };
  const comments = check.ref.lesson.comments as any[];
  comments.push({ studentId: oid(actor.id), name: actorName(actor), text });
  if (comments.length > 200) comments.splice(0, comments.length - 200);
  await check.ref.course.save();
  return {
    status: 201,
    body: {
      data: comments.slice(-50).map((c: any) => ({
        id: c._id?.toString() || "",
        name: c.name || "Student",
        text: c.text,
        createdAt: c.createdAt
      }))
    }
  };
}

export async function lessonAnalytics(courseId: string, actor: CourseActor) {
  const course: any = await CourseModel.findById(courseId).lean();
  if (!course) return { status: 404, body: { message: "Course not found." } };
  if (!canManage(course, actor)) return { status: 403, body: { message: "Only the course owner or an admin can view analytics." } };
  const rows: any[] = [];
  for (const m of course.modules || []) {
    for (const l of m.lessons || []) {
      rows.push({
        lessonId: l._id.toString(),
        moduleTitle: m.title,
        title: l.title,
        views: l.views || 0,
        likes: (l.likes || []).length,
        shares: l.shares || 0,
        comments: (l.comments || []).length
      });
    }
  }
  return { status: 200, body: { data: rows } };
}
