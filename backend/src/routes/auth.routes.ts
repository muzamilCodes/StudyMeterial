import { Router } from "express";
import {
  deleteAccountHandler,
  forgotPasswordHandler,
  login,
  register,
  resetPasswordHandler,
  sendSignupOtpHandler
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/send-otp", sendSignupOtpHandler);
router.post("/register", register);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/delete-account", deleteAccountHandler);

export default router;
