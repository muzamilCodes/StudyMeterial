import type { Request, Response } from "express";
import { getDashboardSummary } from "../services.js";

export async function dashboard(req: Request, res: Response) {
  const summary = await getDashboardSummary();
  res.json({
    message: "Admin dashboard data",
    summary,
    admin: (req as Request & { user?: { email: string; role: string } }).user
  });
}
