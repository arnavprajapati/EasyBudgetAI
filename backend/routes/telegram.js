import express from "express";
import {
    generateTelegramOTP,
    verifyOTPFromWebsite,
    unlinkTelegram,
    getTelegramStatus,
} from "../controllers/telegram.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/generate-otp", isAuth, verifyCSRFToken, generateTelegramOTP);
router.post("/verify-otp", isAuth, verifyCSRFToken, verifyOTPFromWebsite);
router.post("/unlink", isAuth, verifyCSRFToken, unlinkTelegram);
router.get("/status", isAuth, getTelegramStatus);


export default router;