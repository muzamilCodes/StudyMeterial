import { Router } from "express";
import { listClasses, listSubjects } from "../controllers/subjects.controller.js";

const router = Router();

router.get("/classes", listClasses);
router.get("/", listSubjects);

export default router;
