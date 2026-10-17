import { Router } from "express";
import multer from "multer";
import {
  attendanceHandler,
  createLiveClassHandler,
  createNoticeHandler,
  createNoteHandler,
  createPaperHandler,
  createQuizHandler,
  createVideoHandler,
  deleteLiveClassHandler,
  deleteNoteHandler,
  deletePaperHandler,
  deleteVideoHandler,
  listAttendanceHandler,
  listLiveClassesHandler,
  listNoticesHandler,
  listNotesHandler,
  listPapersHandler,
  listQuizzesHandler,
  listVideosHandler,
  publishLiveClassHandler,
  updateLiveClassHandler,
  uploadHandler
} from "../controllers/content.controller.js";
import { upload } from "../middleware/upload.js";
import { requireAnyRole, requireAuth } from "../auth.js";

const router = Router();

const staffOnly = requireAnyRole(["superAdmin", "admin", "teacher"]);

router.get("/live-classes", listLiveClassesHandler);
router.post("/live-classes", staffOnly, createLiveClassHandler);
router.put("/live-classes/:id", staffOnly, updateLiveClassHandler);
router.delete("/live-classes/:id", staffOnly, deleteLiveClassHandler);
router.post("/live-classes/:id/publish", staffOnly, publishLiveClassHandler);
router.post("/live-classes/:id/attendance", requireAuth, attendanceHandler);
router.get("/attendance", staffOnly, listAttendanceHandler);

router.get("/notes", listNotesHandler);
router.post("/notes", staffOnly, createNoteHandler);
router.delete("/notes/:id", staffOnly, deleteNoteHandler);

router.get("/papers", listPapersHandler);
router.post("/papers", staffOnly, createPaperHandler);
router.delete("/papers/:id", staffOnly, deletePaperHandler);

router.get("/videos", listVideosHandler);
router.post("/videos", staffOnly, createVideoHandler);
router.delete("/videos/:id", staffOnly, deleteVideoHandler);

router.get("/quizzes", listQuizzesHandler);
router.post("/quizzes", staffOnly, createQuizHandler);

router.get("/notices", listNoticesHandler);
router.post("/notices", staffOnly, createNoticeHandler);

router.post("/upload", staffOnly, upload.single("file"), uploadHandler);

export default router;
