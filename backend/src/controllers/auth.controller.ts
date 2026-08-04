import type { Request, Response } from "express";
import { z } from "zod";
import { deleteAccount, forgotPassword, loginUser, registerUser, resetPassword } from "../services.js";

const loginSchema = z.object({
  email:    z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const registerSchema = z.object({
  email:           z.string().email({ message: "Please enter a valid email address" }),
  password:        z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }).optional(),
  grade:           z.enum(["10th", "11th", "12th"], { error: "Please select a valid class (10th, 11th, or 12th)" }),
  stream:          z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"], { error: "Please select a valid stream" }),
  username:        z.string().min(2, { message: "Name must be at least 2 characters" }).optional()
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid email or password";
    return res.status(400).json({ message: firstError });
  }
  const result = await loginUser(parsed.data);
  return res.status(result.status).json(result.body);
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Please fill all required fields correctly";
    return res.status(400).json({ message: firstError });
  }
  // Only check password match if confirmPassword was provided
  if (parsed.data.confirmPassword && parsed.data.password !== parsed.data.confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match. Please try again." });
  }
  const result = await registerUser(parsed.data);
  return res.status(result.status).json(result.body);
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  const email = z.string().email({ message: "Please enter a valid email address" }).safeParse(req.body?.email);
  if (!email.success) return res.status(400).json({ message: email.error.issues[0]?.message ?? "Invalid email" });
  const result = await forgotPassword(email.data);
  return res.status(result.status).json(result.body);
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const schema = z.object({
    email:    z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid reset payload";
    return res.status(400).json({ message: firstError });
  }
  const result = await resetPassword(parsed.data.email, parsed.data.password);
  return res.status(result.status).json(result.body);
}

export async function deleteAccountHandler(req: Request, res: Response) {
  const email = z.string().email({ message: "Please enter a valid email address" }).safeParse(req.body?.email);
  if (!email.success) return res.status(400).json({ message: email.error.issues[0]?.message ?? "Invalid email" });
  const result = await deleteAccount(email.data);
  return res.status(result.status).json(result.body);
}
