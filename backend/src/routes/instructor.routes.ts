import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  applicationStatusHandler,
  decideApplicationHandler,
  decidePermissionRequestHandler,
  getInstructorProfileHandler,
  listApplicationsHandler,
  listPermissionRequestsHandler,
  parseInstructorApplication,
  requestPermissionsHandler,
  submitApplicationHandler,
  updateInstructorProfileHandler
} from "../controllers/instructor.controller.js";
import { requireAnyRole } from "../auth.js";

const router = Router();

const adminOnly = requireAnyRole(["superAdmin", "admin"]);
const instructorOrAdmin = requireAnyRole(["teacher", "admin", "superAdmin"]);

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many applications from this IP. Please try again later." }
});

// Multipart fields: application (JSON string), profilePhoto, resume, teachingCertificate, introVideo, sampleVideo, certificates
router.post("/applications", submitLimiter, parseInstructorApplication, submitApplicationHandler);
router.get("/applications/status", applicationStatusHandler);

// Admin review of initial registrations
router.get("/applications", adminOnly, listApplicationsHandler);
router.patch("/applications/:id/decision", adminOnly, decideApplicationHandler);

// Instructor profile
router.get("/me/profile", instructorOrAdmin, getInstructorProfileHandler);
router.patch("/me/profile", instructorOrAdmin, updateInstructorProfileHandler);

// Additional class/subject permission requests
router.post("/me/permission-requests", instructorOrAdmin, requestPermissionsHandler);
router.get("/permission-requests", adminOnly, listPermissionRequestsHandler);
router.patch("/permission-requests/:id/decision", adminOnly, decidePermissionRequestHandler);

export default router;
