// routes/otpRoutes.js
import express from "express";
import { sendOtp, verifyOtpAndSetPassword } from "../controller/otpController.js";

const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtpAndSetPassword);

export default router;
