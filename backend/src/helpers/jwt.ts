import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signJwt(payload: Record<string, unknown>) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyJwt<T extends object = object>(token: string) {
  return jwt.verify(token, env.jwtSecret) as T;
}
