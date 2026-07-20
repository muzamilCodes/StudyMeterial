import type { Request, Response } from "express";
import { z } from "zod";
import { createResetToken, loginStudent, registerStudent, resetPassword } from "../services.js";
import type { Grade, Stream } from "../types.js";

const gradeSchema = z.enum(["10th", "11th", "12th"]);
const streamSchema = z.enum(["Medical", "Non-Medical", "Commerce", "Arts"]);

export async function login(req: Request, res: Response) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid login payload" });

  try {
    const result = await loginStudent(parsed.data);
    res.json({ message: "Login successful", ...result });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
  }
}

export async function register(req: Request, res: Response) {
  const schema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    grade: gradeSchema,
    stream: streamSchema
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) {
    return res.status(400).json({ message: "Invalid registration payload" });
  }

  try {
    const result = await registerStudent({
      username: parsed.data.username,
      email: parsed.data.email,
      password: parsed.data.password,
      grade: parsed.data.grade as Grade,
      stream: parsed.data.stream as Stream
    });
    res.json({ message: "Registration successful", ...result });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid email" });

  const result = await createResetToken(parsed.data.email);
  res.json({ message: "Reset link sent", email: parsed.data.email, ...result });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const schema = z.object({
    token: z.string().min(10),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) {
    return res.status(400).json({ message: "Invalid reset payload" });
  }

  try {
    const result = await resetPassword({
      token: parsed.data.token,
      password: parsed.data.password
    });
    res.json({ message: "Password updated", ...result });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Reset failed" });
  }
}
