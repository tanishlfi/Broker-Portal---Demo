import { Router } from "express";
import { sendOTP, verifyOTP } from "../controllers/brokerOtpController";
import { validateSendOtp, validateVerifyOtp } from "../middleware/brokerPortal.middleware";

const router = Router();

router.post("/send", validateSendOtp, sendOTP);
router.post("/verify", validateVerifyOtp, verifyOTP);

export default router;
