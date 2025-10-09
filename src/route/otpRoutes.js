// routes/otpRoutes.js
import express from "express";
import { getotpTime, sendOtp, verifyOtpAndSetPassword } from "../controller/otpController.js";

const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtpAndSetPassword);
router.get("/expireTime", getotpTime);

export default router;
