import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contentRoutes from "./routes/content.routes.js";
import { seedDatabase } from "./seed.js";

import path from "path";
import fs from "fs";

dotenv.config();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true
  })
);

app.use("/uploads", express.static(uploadDir));

app.get("/", (_req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Study Material Backend - MongoDB Active</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f8fbff; color: #0f172a; margin: 0; padding: 40px; }
          .card { max-width: 760px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 80px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
          .tag { display: inline-block; background: #eff6ff; color: #2563eb; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: .08em; }
          a { color: #2563eb; text-decoration: none; }
          ul { line-height: 1.9; }
          code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="tag">STUDY MATERIAL BACKEND (MONGODB CONNECTED)</span>
          <h1 style="margin-top: 18px; font-size: 36px;">Database "studymeterial" Active</h1>
          <p style="color:#475569; font-size: 15px; line-height: 1.7;">
            Express & MongoDB backend server is connected and initialized with all 12 Database Collections.
          </p>
          <p><strong>Health Check:</strong> <a href="/health">/health</a></p>
          <p><strong>MongoDB Collections Active:</strong></p>
          <ul>
            <li><code>users</code>, <code>classes</code>, <code>streams</code>, <code>subjects</code></li>
            <li><code>notes</code>, <code>previous_papers</code>, <code>videos</code>, <code>quizzes</code></li>
            <li><code>results</code>, <code>downloads</code>, <code>bookmarks</code>, <code>notices</code></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "study-material-backend", mongodb: process.env.MONGODB_URI ? "connected" : "standalone" });
});

app.use("/api/auth", authRoutes);
app.use("/api", subjectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin", adminRoutes);

const port = Number(process.env.PORT ?? 4000);

// Initialize MongoDB Seeding & Server Startup
void seedDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Study Material Backend running at http://localhost:${port}`);
    console.log(`🍃 MongoDB Connection Target: ${process.env.MONGODB_URI}`);
  });
});
