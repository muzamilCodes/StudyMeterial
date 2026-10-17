import type { Request, Response } from "express";
import { getDashboardSummary } from "../services.js";

export async function dashboard(_req: Request, res: Response) {
  return res.json(await getDashboardSummary());
}
