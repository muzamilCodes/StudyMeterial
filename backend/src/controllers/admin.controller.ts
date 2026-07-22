import type { Request, Response } from "express";
import { getDashboardSummary, getRegisteredUsers } from "../services.js";

export async function dashboard(req: Request, res: Response) {
  const summary = await getDashboardSummary();
  const users = await getRegisteredUsers();
  res.json({
    message: "Admin dashboard data",
    summary,
    users,
    admin: (req as Request & { user?: { email: string; role: string } }).user
  });
}
