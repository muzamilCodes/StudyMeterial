import type { Request, Response } from "express";
import { z } from "zod";
import { deleteAccount, forgotPassword, loginUser, registerUser, resetPassword, sendSignupOtp, verifyAdminCredentials } from "../services.js";

const loginSchema = z.object({
  email:    z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const sendOtpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(7).optional()
});

const registerSchema = z.object({
  email:           z.string().email({ message: "Please enter a valid email address" }),
  password:        z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }).optional(),
  grade:           z.enum(["10th", "11th", "12th"], { error: "Please select a valid class (10th, 11th, or 12th)" }),
  stream:          z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"], { error: "Please select a valid stream" }),
  username:        z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  role:            z.enum(["superAdmin", "admin", "teacher", "student"]).optional(),
  otp:             z.string().min(4).optional(),
  phone:           z.string().min(7, { message: "Please enter a valid phone number" }).optional(),
  adminEmail:      z.string().email().optional(),
  adminPassword:   z.string().min(6).optional()
});

export async function sendSignupOtpHandler(req: Request, res: Response) {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid request" });
  }
  const result = await sendSignupOtp(parsed.data.email, parsed.data.phone);
  return res.status(result.status).json(result.body);
}

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

  const privileged = parsed.data.role === "admin" || parsed.data.role === "superAdmin" || parsed.data.role === "teacher";
  if (privileged) {
    if (!parsed.data.adminEmail || !parsed.data.adminPassword) {
      return res.status(403).json({ message: `Creating a ${parsed.data.role} account requires an existing administrator's email and password for authorization.` });
    }
    const authorizer = await verifyAdminCredentials(parsed.data.adminEmail, parsed.data.adminPassword);
    if (!authorizer) {
      return res.status(403).json({ message: "Administrator authorization failed: invalid admin email or password." });
    }
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
    token:    z.string().min(16, { message: "Please provide the reset token from your email request" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid reset payload";
    return res.status(400).json({ message: firstError });
  }
  const result = await resetPassword(parsed.data.email, parsed.data.password, parsed.data.token);
  return res.status(result.status).json(result.body);
}

export async function deleteAccountHandler(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Authentication required to delete your account" });
  const result = await deleteAccount({ id: user.id, email: user.email });
  return res.status(result.status).json(result.body);
}
