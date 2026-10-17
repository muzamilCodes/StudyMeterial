import { Router } from "express";
import { dashboard } from "../controllers/admin.controller.js";
import { requireAnyRole } from "../auth.js";

const router = Router();

router.get("/dashboard", requireAnyRole(["superAdmin", "admin"]), dashboard);

export default router;
