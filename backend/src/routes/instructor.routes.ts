import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  applicationStatusHandler,
  decideApplicationHandler,
  listApplicationsHandler,
  parseInstructorApplication,
  submitApplicationHandler
} from "../controllers/instructor.controller.js";
import { requireAnyRole } from "../auth.js";

const router = Router();

const adminOnly = requireAnyRole(["superAdmin", "admin"]);

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many applications from this IP. Please try again later." }
});

// Multipart fields: application (JSON string), profilePhoto, resume, teachingCertificate, certificates
router.post("/applications", submitLimiter, parseInstructorApplication, submitApplicationHandler);

router.get("/applications/status", applicationStatusHandler);

router.get("/applications", adminOnly, listApplicationsHandler);
router.patch("/applications/:id/decision", adminOnly, decideApplicationHandler);

export default router;
