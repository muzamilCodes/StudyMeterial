import type { Request, Response, NextFunction } from "express";

export function teacherMiddleware(_req: Request, _res: Response, next: NextFunction) {
  return next();
}
