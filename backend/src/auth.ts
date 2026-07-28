import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import type { JwtRole } from "./types.js";

export type AuthPayload = {
  userId: string;
  role: JwtRole;
  email: string;
};

const fallbackSecret = "study-material-platform-secret";

export function signToken(payload: AuthPayload) {
  const secret = process.env.JWT_SECRET ?? fallbackSecret;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
