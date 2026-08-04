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

const router = Router();

router.get("/live-classes", listLiveClassesHandler);
router.post("/live-classes", createLiveClassHandler);
router.put("/live-classes/:id", updateLiveClassHandler);
router.delete("/live-classes/:id", deleteLiveClassHandler);
router.post("/live-classes/:id/publish", publishLiveClassHandler);
router.post("/live-classes/:id/attendance", attendanceHandler);

router.get("/notes", listNotesHandler);
router.post("/notes", createNoteHandler);
router.delete("/notes/:id", deleteNoteHandler);

router.get("/papers", listPapersHandler);
router.post("/papers", createPaperHandler);
router.delete("/papers/:id", deletePaperHandler);

router.get("/videos", listVideosHandler);
router.post("/videos", createVideoHandler);
router.delete("/videos/:id", deleteVideoHandler);

router.get("/quizzes", listQuizzesHandler);
router.post("/quizzes", createQuizHandler);

router.get("/notices", listNoticesHandler);
router.post("/notices", createNoticeHandler);

router.post("/upload", upload.single("file"), uploadHandler);

export default router;
