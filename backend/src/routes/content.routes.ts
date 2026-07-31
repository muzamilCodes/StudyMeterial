import { Router } from "express";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  createNote,
  createNotice,
  createPaper,
  createQuiz,
  createVideo,
  listDownloads,
  listNotes,
  listNotices,
  listPapers,
  listProgress,
  listQuizzes,
  listResults,
  listVideos,
  deleteNote,
  deletePaper,
  deleteVideo,
  uploadFile,
  listLiveClasses,
  getLiveClassById,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass,
  publishLiveClass,
  logAttendance,
  postLiveChat,
  getLiveChat,
  submitFeedback
} from "../controllers/content.controller.js";

const router = Router();

// Public / Authenticated Read Endpoints
router.get("/notes", listNotes);
router.get("/papers", listPapers);
router.get("/videos", listVideos);
router.get("/quizzes", listQuizzes);
router.get("/notices", listNotices);
router.get("/downloads", listDownloads);
router.get("/results", listResults);
router.get("/progress", listProgress);

// Live Classes REST Endpoints
router.get("/live-classes", listLiveClasses);
router.get("/live-classes/:id", getLiveClassById);
router.get("/live-classes/:id/chat", getLiveChat);
router.post("/live-classes/:id/chat", verifyToken, postLiveChat);
router.post("/live-classes/:id/attendance", verifyToken, logAttendance);
router.post("/live-classes/:id/feedback", verifyToken, submitFeedback);

// Admin Content Creation & Management
router.post("/notes", verifyToken, requireRole("admin"), createNote);
router.post("/papers", verifyToken, requireRole("admin"), createPaper);
router.post("/videos", verifyToken, requireRole("admin"), createVideo);
router.post("/quizzes", verifyToken, requireRole("admin"), createQuiz);
router.post("/notices", verifyToken, requireRole("admin"), createNotice);
router.post("/upload", verifyToken, requireRole("admin"), upload.single("file"), uploadFile);

// Live Classes Admin Controls
router.post("/live-classes", verifyToken, requireRole("admin"), createLiveClass);
router.put("/live-classes/:id", verifyToken, requireRole("admin"), updateLiveClass);
router.post("/live-classes/:id/publish", verifyToken, requireRole("admin"), publishLiveClass);
router.delete("/live-classes/:id", verifyToken, requireRole("admin"), deleteLiveClass);

// Standard Deletions
router.delete("/notes/:id", verifyToken, requireRole("admin"), deleteNote);
router.delete("/papers/:id", verifyToken, requireRole("admin"), deletePaper);
router.delete("/videos/:id", verifyToken, requireRole("admin"), deleteVideo);

export default router;
