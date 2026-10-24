import type { Request, Response } from "express";
import { getDashboardSummary } from "../services.js";
import { adminFinancials } from "../services.course.js";

export async function dashboard(_req: Request, res: Response) {
  return res.json(await getDashboardSummary());
}

export async function financials(_req: Request, res: Response) {
  const data = await adminFinancials();
  return res.json(data);
}
