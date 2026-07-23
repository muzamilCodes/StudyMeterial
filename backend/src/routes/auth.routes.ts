import { Router } from "express";
import { forgotPassword, login, register, resetPasswordHandler, deleteAccount } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/delete-account", deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordHandler);

export default router;
