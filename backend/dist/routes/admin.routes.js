import { Router } from "express";
import { dashboard } from "../controllers/admin.controller.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
const router = Router();
router.use(verifyToken);
router.use(requireRole("admin"));
router.get("/dashboard", dashboard);
export default router;
