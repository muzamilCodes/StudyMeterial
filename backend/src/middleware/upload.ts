import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";

const uploadDir = path.resolve("uploads");
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `file-${unique}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ storage });

const INSTRUCTOR_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".mp4", ".webm"];

function isAllowedInstructorFile(file: { originalname: string; mimetype: string }) {
  const ext = path.extname(file.originalname).toLowerCase();
  return INSTRUCTOR_EXTENSIONS.includes(ext);
}

/** Instructor application uploads are submitted before any account exists, so they are
 *  stricter than the staff uploader: whitelisted types only, 5 MB documents and up to
 *  25 MB for the optional intro/demo video. */
export const instructorUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedInstructorFile(file)) {
      cb(new Error(`Unsupported file type "${path.extname(file.originalname) || file.mimetype}". Only PDF, DOC, DOCX, JPG, PNG, MP4 and WebM are allowed.`));
      return;
    }
    cb(null, true);
  }
});
