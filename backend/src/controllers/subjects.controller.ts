import type { Request, Response } from "express";
import { z } from "zod";
import { getSubjectsForClass } from "../services.js";

const gradeSchema = z.enum(["10th", "11th", "12th"]);
const streamSchema = z.enum(["Medical", "Non-Medical", "Commerce", "Arts"]);

export async function listClasses(_req: Request, res: Response) {
  res.json({
    data: {
      "10th": { label: "10th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
      "11th": { label: "11th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] },
      "12th": { label: "12th", streams: ["Medical", "Non-Medical", "Commerce", "Arts"] }
    }
  });
}

export async function listSubjects(req: Request, res: Response) {
  const parsed = z
    .object({
      grade: gradeSchema,
      stream: streamSchema
    })
    .safeParse({
      grade: req.query.grade,
      stream: req.query.stream
    });

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid class selection" });
  }

  const data = await getSubjectsForClass(parsed.data.grade, parsed.data.stream);
  res.json({ grade: parsed.data.grade, stream: parsed.data.stream, data });
}
