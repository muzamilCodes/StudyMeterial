import { Router } from "express";
import { dashboard } from "../controllers/admin.controller.js";
import { requireAnyRole } from "../auth.js";

const router = Router();

router.get("/summary", requireAnyRole(["superAdmin", "admin", "teacher"]), dashboard);

export default router;
