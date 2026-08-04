import { Router } from "express";
import { dashboard } from "../controllers/admin.controller.js";

const router = Router();

router.get("/summary", dashboard);

export default router;
