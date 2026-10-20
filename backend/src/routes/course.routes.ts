import { Router } from "express";
import {
  addReviewHandler,
  completeLessonHandler,
  courseDetailHandler,
  createAssignmentHandler,
  createCourseHandler,
  deleteAssignmentHandler,
  deleteCourseHandler,
  enrollCourseHandler,
  homepageLessonVideosHandler,
  instructorEnrollmentsHandler,
  instructorReviewsHandler,
  instructorStatsHandler,
  lessonAnalyticsHandler,
  lessonCommentHandler,
  lessonLikeHandler,
  lessonShareHandler,
  lessonViewHandler,
  listAssignmentsHandler,
  listCoursesHandler,
  listReviewsHandler,
  myEnrollmentsHandler,
  setCourseStatusHandler,
  updateCourseHandler
} from "../controllers/course.controller.js";
import { authOptional, requireAnyRole, requireAuth } from "../auth.js";

const router = Router();

const staffOnly = requireAnyRole(["superAdmin", "admin", "teacher"]);

router.get("/instructor/stats", staffOnly, instructorStatsHandler);
router.get("/instructor/enrollments", staffOnly, instructorEnrollmentsHandler);
router.get("/instructor/reviews", staffOnly, instructorReviewsHandler);

router.get("/assignments", listAssignmentsHandler);
router.post("/assignments", staffOnly, createAssignmentHandler);
router.delete("/assignments/:id", staffOnly, deleteAssignmentHandler);

router.get("/", listCoursesHandler);
router.post("/", staffOnly, createCourseHandler);

router.get("/lessons/feed", authOptional, homepageLessonVideosHandler);
router.get("/my-enrollments", requireAuth, myEnrollmentsHandler);

router.get("/:id", courseDetailHandler);
router.put("/:id", staffOnly, updateCourseHandler);
router.delete("/:id", staffOnly, deleteCourseHandler);
router.post("/:id/status", staffOnly, setCourseStatusHandler);
router.post("/:id/enroll", requireAuth, enrollCourseHandler);
router.post("/:id/lessons/:lessonId/complete", requireAuth, completeLessonHandler);
router.post("/:id/lessons/:lessonId/view", authOptional, lessonViewHandler);
router.post("/:id/lessons/:lessonId/share", requireAuth, lessonShareHandler);
router.post("/:id/lessons/:lessonId/like", requireAuth, lessonLikeHandler);
router.post("/:id/lessons/:lessonId/comments", requireAuth, lessonCommentHandler);
router.get("/:id/analytics", requireAuth, staffOnly, lessonAnalyticsHandler);
router.get("/:id/reviews", listReviewsHandler);
router.post("/:id/reviews", requireAuth, addReviewHandler);

export default router;
