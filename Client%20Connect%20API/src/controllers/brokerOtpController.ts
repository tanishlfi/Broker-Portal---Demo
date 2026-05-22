import { Request, Response } from "express";
import { BrokerOtpService } from "../services/brokerOtp.service";

const otpService = new BrokerOtpService();

/**
 * @swagger
 * /broker/otp/send:
 *   post:
 *     summary: Generate and send a 6-digit OTP to the Employer contact
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quoteId
 *             properties:
 *               quoteId:
 *                 type: string
 *                 description: The UUID of the Quote
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Quote not found
 *       500:
 *         description: Internal server error
 */
export const sendOTP = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    const result = await otpService.sendOTP(payload);
    return res.status(200).json({
      success: true,
      message: "Verification code sent.",
      data: result
    });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @swagger
 * /broker/otp/verify:
 *   post:
 *     summary: Verify OTP and trigger the onboarding/acceptance workflow
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quoteId
 *               - otpCode
 *             properties:
 *               quoteId:
 *                 type: string
 *                 description: The UUID of the Quote
 *               otpCode:
 *                 type: string
 *                 description: The 6-digit code sent to the user
 *     responses:
 *       200:
 *         description: OTP verified and workflow triggered
 *       400:
 *         description: Invalid or expired OTP
 *       403:
 *         description: OTP blocked due to many attempts
 *       500:
 *         description: Internal server error
 */
export const verifyOTP = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    await otpService.verifyOTP(payload);
    return res.status(200).json({
      success: true,
      message: "Verification successful."
    });
  } catch (error: any) {
    return res.status(error.message.includes("blocked") ? 403 : 400).json({
      success: false,
      message: error.message
    });
  }
};
