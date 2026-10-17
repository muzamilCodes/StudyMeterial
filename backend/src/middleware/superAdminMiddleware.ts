import type { Request, Response, NextFunction } from "express";

export function superAdminMiddleware(_req: Request, _res: Response, next: NextFunction) {
  return next();
}
