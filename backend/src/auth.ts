import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import type { Role } from "./types.js";
import { UserModel } from "./models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type AuthTokenPayload = {
  sub: string;
  role: Role;
  email: string;
  username: string;
};

export function signToken(user: any) {
  const payload: AuthTokenPayload = {
    sub:      user._id?.toString() ?? user.id,
    role:     user.role,
    email:    user.email,
    username: user.username
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return next();

  try {
    const token   = header.slice("Bearer ".length);
    const payload = verifyJwt(token);
    const user    = await UserModel.findById(payload.sub).lean();
    if (user) {
      (req as any).user = {
        id:           (user as any)._id.toString(),
        username:     (user as any).username,
        email:        (user as any).email,
        passwordHash: (user as any).passwordHash,
        role:         (user as any).role as Role,
        grade:        (user as any).grade,
        stream:       (user as any).stream,
        createdAt:    (user as any).createdAt?.toISOString?.() ?? ""
      };
    }
  } catch {
    // Ignore bad tokens
  }

  return next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.role === role) return next();
    return res.status(403).json({ message: "Forbidden" });
  };
}
