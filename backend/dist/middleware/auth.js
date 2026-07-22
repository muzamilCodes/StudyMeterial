import jwt from "jsonwebtoken";
const fallbackSecret = "study-material-platform-secret";
export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const secret = process.env.JWT_SECRET ?? fallbackSecret;
        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}
export function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}
