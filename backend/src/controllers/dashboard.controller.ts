import type { Request, Response } from "express";
import { getDashboardSummary } from "../services.js";

export async function summary(_req: Request, res: Response) {
  res.json(await getDashboardSummary());
}
