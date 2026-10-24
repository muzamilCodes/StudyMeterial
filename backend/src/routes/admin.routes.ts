import { Router } from "express";
import { dashboard, financials } from "../controllers/admin.controller.js";
import { requireAnyRole } from "../auth.js";

const router = Router();
const adminOnly = requireAnyRole(["superAdmin", "admin"]);

router.get("/dashboard", adminOnly, dashboard);
router.get("/financials", adminOnly, financials);

export default router;
