import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const fallbackSecret = "study-material-platform-secret";
export function signToken(payload) {
    const secret = process.env.JWT_SECRET ?? fallbackSecret;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
    const options = { expiresIn: expiresIn };
    return jwt.sign(payload, secret, options);
}
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
