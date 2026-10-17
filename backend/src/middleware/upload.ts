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
