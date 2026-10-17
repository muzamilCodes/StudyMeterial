import type { Request, Response, NextFunction } from "express";

export function otpMiddleware(_req: Request, _res: Response, next: NextFunction) {
  return next();
}
