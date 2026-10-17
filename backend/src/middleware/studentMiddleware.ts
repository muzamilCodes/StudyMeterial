import type { Request, Response, NextFunction } from "express";

export function studentMiddleware(_req: Request, _res: Response, next: NextFunction) {
  return next();
}
