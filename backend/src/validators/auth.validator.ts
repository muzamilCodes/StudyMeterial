import { z } from "zod";

export const loginValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6).optional(),
  grade: z.enum(["10th", "11th", "12th"]),
  stream: z.enum(["General", "Medical", "Non-Medical", "Commerce", "Arts"]),
  role: z.enum(["superAdmin", "admin", "teacher", "student"]).optional(),
  username: z.string().min(2).optional()
});
