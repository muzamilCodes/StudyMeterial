import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { mkdirSync } from "fs";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contentRoutes from "./routes/content.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import { authOptional } from "./auth.js";

const app = express();

app.set("trust proxy", 1);

mkdirSync(path.resolve("uploads"), { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts from this IP. Please try again in a few minutes." },
});

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many subscription attempts. Please try again later." },
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "studymaterial-backend" });
});

app.use(authOptional);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/newsletter", newsletterLimiter, newsletterRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/classes", (_req, res) => {
  res.json({
    data: [
      { id: "10th", label: "10th Class", streams: ["General"] },
      { id: "11th", label: "11th Class", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
      { id: "12th", label: "12th Class", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] }
    ]
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.path });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ message });
});

export default app;
