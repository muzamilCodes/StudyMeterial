import { Router } from "express";
import { z } from "zod";
import { gradeStreams, subjectDirectory } from "../data.js";

const router = Router();

router.get("/", (req, res) => {
  const parsed = z.object({
    grade: z.enum(["10th", "11th", "12th"]).optional(),
    stream: z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]).optional()
  }).safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid subject selection" });
  }

  const grade = parsed.data.grade ?? "11th";
  const stream = parsed.data.stream ?? "Medical";
  return res.json({
    data: {
      grade,
      stream,
      streams: gradeStreams[grade],
      subjects: subjectDirectory[grade][stream]
    }
  });
});

export default router;
