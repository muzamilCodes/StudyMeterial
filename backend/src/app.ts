import express from "express";
import cors from "cors";
import path from "path";
import { mkdirSync } from "fs";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contentRoutes from "./routes/content.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import { authOptional } from "./auth.js";

const app = express();

mkdirSync(path.resolve("uploads"), { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "studymaterial-backend" });
});

app.use(authOptional);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/newsletter", newsletterRoutes);
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
