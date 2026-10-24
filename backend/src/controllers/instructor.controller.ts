import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { MulterError } from "multer";
import { instructorUpload } from "../middleware/upload.js";
import {
  getInstructorApplicationStatus,
  getInstructorProfile,
  listAllPermissionRequests,
  listInstructorApplications,
  resolveInstructorApplication,
  resolveTeachingPermissionRequest,
  submitInstructorApplication,
  submitTeachingPermissionRequest,
  updateInstructorProfile
} from "../services.js";

const applicationSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  personal: z.object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    email:    z.string().email({ message: "Enter a valid email address" }),
    phone:    z.string().min(7, { message: "Enter a valid phone number" }),
    country:  z.string().min(2, { message: "Select your country" }),
    state:    z.string().min(2, { message: "Select your state" }),
    city:     z.string().min(2, { message: "Enter your city or district" }),
    addressLine:    z.string().min(6, { message: "Enter your complete address" }),
    messageToAdmin: z.string().max(1000).optional().default("")
  }),
  selectedClasses:  z.array(z.string().min(1)).min(1, { message: "Select at least one class you want to teach." }),
  selectedSubjects: z.array(z.string().min(1)).min(1, { message: "Select at least one subject you can teach." }),
  classSubjects:    z.array(z.object({ class: z.string(), subjects: z.array(z.string()) })).optional().default([]),
  professional: z.object({
    headline:           z.string().min(4, { message: "Instructor headline is required" }),
    bio:                z.string().min(20, { message: "Write a bio of at least 20 characters" }),
    subjectExpertise:   z.array(z.string()).optional().default([]),
    teachingExperience: z.string().min(2, { message: "Select your teaching experience" }),
    currentOccupation:  z.string().min(2, { message: "Select your current occupation" }),
    preferredLanguage:  z.string().optional().default("English")
  }),
  education: z.object({
    highestQualification: z.string().min(2, { message: "Select your highest qualification" }),
    degreeName:           z.string().min(2, { message: "Degree name is required" }),
    specialization:       z.string().optional(),
    collegeUniversity:    z.string().min(2, { message: "College or university is required" }),
    passingYear:          z.string().regex(/^\d{4}$/, { message: "Select your passing year" })
  })
});

const allowedFields = ["profilePhoto", "resume", "teachingCertificate", "introVideo", "sampleVideo", "certificates"] as const;

const fieldsConfig = [
  { name: "profilePhoto",        maxCount: 1 },
  { name: "resume",              maxCount: 1 },
  { name: "teachingCertificate", maxCount: 1 },
  { name: "introVideo",          maxCount: 1 },
  { name: "sampleVideo",         maxCount: 1 },
  { name: "certificates",        maxCount: 4 }
];

/** Runs the multipart parser and turns multer's own failures into 400 responses. */
export function parseInstructorApplication(req: Request, res: Response, next: NextFunction) {
  instructorUpload.fields(fieldsConfig)(req, res, (err: unknown) => {
    if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File too large: documents/images must be 5 MB or smaller, videos 25 MB." });
      return;
    }
    if (err instanceof Error && err.message.startsWith("Unsupported file type")) {
      res.status(400).json({ message: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ message: "Upload failed: " + String((err as any)?.message ?? err) });
      return;
    }
    next();
  });
}

type InstructorFiles = Record<string, Express.Multer.File | Express.Multer.File[]>;

function collectFiles(req: Request): InstructorFiles {
  const out: InstructorFiles = {};
  const fields = req.files as unknown as Partial<Record<string, Express.Multer.File[]>> | undefined;
  if (!fields) return out;
  for (const key of allowedFields) {
    const list = fields[key];
    if (list && list.length) out[key] = key === "certificates" ? list : list[0];
  }
  return out;
}

export async function submitApplicationHandler(req: Request, res: Response) {
  let payload: any;
  try {
    payload = JSON.parse(String(req.body?.application ?? ""));
  } catch {
    return res.status(400).json({ message: "Application data is missing or malformed" });
  }

  // Backwards compatibility: if professional.subjectExpertise provided but not selectedSubjects
  if (!payload.selectedSubjects?.length && payload.professional?.subjectExpertise?.length) {
    payload.selectedSubjects = payload.professional.subjectExpertise;
  }
  if (!payload.selectedClasses?.length) {
    payload.selectedClasses = ["Class 10", "Class 11", "Class 12"];
  }

  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid application payload" });
  }

  const collected = collectFiles(req);
  const resume = collected.resume as Express.Multer.File | undefined;
  if (!resume) {
    return res.status(400).json({ message: "Resume / CV upload is required (PDF, DOC or DOCX, max 5 MB)." });
  }

  const files = {
    profilePhoto:        collected.profilePhoto as Express.Multer.File | undefined,
    resume,
    teachingCertificate: collected.teachingCertificate as Express.Multer.File | undefined,
    introVideo:          collected.introVideo as Express.Multer.File | undefined,
    sampleVideo:         collected.sampleVideo as Express.Multer.File | undefined,
    certificates:        (collected.certificates as Express.Multer.File[] | undefined) ?? []
  };

  const result = await submitInstructorApplication(parsed.data, files);
  return res.status(result.status).json(result.body);
}

export async function applicationStatusHandler(req: Request, res: Response) {
  const email = z.string().email().safeParse(String(req.query.email ?? req.body?.email ?? "").toLowerCase());
  if (!email.success) return res.status(400).json({ message: "Enter a valid email address" });
  const result = await getInstructorApplicationStatus(email.data);
  return res.status(result.status).json(result.body);
}

export async function listApplicationsHandler(req: Request, res: Response) {
  const status = String(req.query.status ?? "all");
  return res.json(await listInstructorApplications(status));
}

export async function decideApplicationHandler(req: Request, res: Response) {
  const reviewer = (req as any).user;
  if (!reviewer) return res.status(401).json({ message: "Authentication required" });

  const schema = z.object({
    decision: z.enum(["approved", "rejected"]),
    note:     z.string().max(500).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Decision must be either approved or rejected" });

  const id = String(req.params.id ?? "");
  if (!id) return res.status(400).json({ message: "Application id is required" });

  const result = await resolveInstructorApplication(id, parsed.data.decision, parsed.data.note ?? "", reviewer.email);
  return res.status(result.status).json(result.body);
}

// ─── Profile & Permission Requests Handlers ───────────────────────────────

export async function getInstructorProfileHandler(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) return res.status(401).json({ message: "Authentication required" });
  const result = await getInstructorProfile(user.id);
  return res.status(result.status).json(result.body);
}

export async function updateInstructorProfileHandler(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) return res.status(401).json({ message: "Authentication required" });

  const result = await updateInstructorProfile(user.id, req.body || {});
  return res.status(result.status).json(result.body);
}

export async function requestPermissionsHandler(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) return res.status(401).json({ message: "Authentication required" });

  const schema = z.object({
    requestedClasses:       z.array(z.string().min(1)).min(1, { message: "Select at least one class to request" }),
    requestedSubjects:      z.array(z.string().min(1)).min(1, { message: "Select at least one subject to request" }),
    requestedClassSubjects: z.array(z.object({ class: z.string(), subjects: z.array(z.string()) })).optional(),
    reason:                 z.string().max(500).optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid request body" });
  }

  const result = await submitTeachingPermissionRequest(user.id, parsed.data);
  return res.status(result.status).json(result.body);
}

export async function listPermissionRequestsHandler(req: Request, res: Response) {
  const status = String(req.query.status ?? "all");
  return res.json(await listAllPermissionRequests(status));
}

export async function decidePermissionRequestHandler(req: Request, res: Response) {
  const reviewer = (req as any).user;
  if (!reviewer) return res.status(401).json({ message: "Authentication required" });

  const schema = z.object({
    decision: z.enum(["approved", "rejected"]),
    note:     z.string().max(500).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Decision must be either approved or rejected" });

  const id = String(req.params.id ?? "");
  if (!id) return res.status(400).json({ message: "Request id is required" });

  const result = await resolveTeachingPermissionRequest(id, parsed.data.decision, parsed.data.note ?? "", reviewer.email);
  return res.status(result.status).json(result.body);
}
