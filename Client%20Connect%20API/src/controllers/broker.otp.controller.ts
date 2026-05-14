import { Request, Response } from "express";
import { sendBrokerEmail } from "../utils/brokerSendEmail";
import { sendOtpSchema, verifyOtpSchema } from "../utils/validation";
import { v4 as uuidv4 } from "uuid";
import { BrokerOnboardingService } from "../services/broker.onboarding.service";
import { logger } from "../middleware/logger";
import { Op } from "sequelize";
import cache from "../utils/cache";

// Lazy load models to avoid blocking on startup
let models: any = null;
const getModels = () => {
  if (!models) {
    models = require("../models");
  }
  return models;
};

/**
 * @swagger
 * /broker/otp/send:
 *   post:
 *     summary: Generate and send a 6-digit OTP to the Employer contact via API infrastructure
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referenceId
 *               - referenceType
 *             properties:
 *               referenceId:
 *                 type: string
 *                 description: The UUID of the Lead or Quote
 *               referenceType:
 *                 type: string
 *                 enum: [Lead, Quote]
 *                 description: The type of reference
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Reference not found
 *       500:
 *         description: Internal server error
 */
export const sendOTP = async (req: Request, res: Response) => {
  const { BrokerQuote, BrokerLead, BrokerContact } = getModels();

  try {
    const validatedBody = await sendOtpSchema.validate(req.body, { abortEarly: false });
    const { referenceId, referenceType } = validatedBody;

    let targetEmail = "";
    let recipientName = "";
    let canonicalReferenceId = referenceId;

    if (referenceType === "Quote") {
      const quote = await BrokerQuote.findOne({
        where: {
          [Op.or]: [
            { quote_id: referenceId },
            { quote_reference: referenceId },
          ],
        },
        include: [
          {
            model: BrokerLead,
            as: "lead",
            include: [{ model: BrokerContact, as: "contact" }],
          },
        ],
      });
      if (!quote) {
        return res.status(404).json({ success: false, message: "Quote not found. Invalid reference ID." });
      }
      canonicalReferenceId = quote.quote_id;
      targetEmail = quote.lead?.contact?.contact_email || "employer@example.com";
      recipientName = quote.lead?.contact
        ? `${quote.lead.contact.contact_first_name} ${quote.lead.contact.contact_last_name}`
        : "Employer";
    } else if (referenceType === "Lead") {
      const lead = await BrokerLead.findOne({
        where: {
          [Op.or]: [
            { lead_id: referenceId },
            { lead_reference: referenceId },
          ],
        },
        include: [{ model: BrokerContact, as: "contact" }],
      });
      if (!lead) {
        return res.status(404).json({ success: false, message: "Lead not found. Invalid reference ID." });
      }
      canonicalReferenceId = lead.lead_id;
      targetEmail = lead.contact?.contact_email || "employer@example.com";
      recipientName = lead.contact
        ? `${lead.contact.contact_first_name} ${lead.contact.contact_last_name}`
        : "Employer";
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Standard stateless memory cache + standard broker email sending flow
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store securely in volatile stateless cache with automated 5-minute eviction TTL
    cache.set(
      `otp_${canonicalReferenceId}`,
      { otpCode, attempts: 0, isBlocked: false },
      300
    );

    // Dispatch email notification using established graph integration flow
    await sendBrokerEmail({
      email: targetEmail,
      recipientName,
      subject: "Action Required: Your Secure OTP for Quote Acceptance",
      title: "Quote Verification Code",
      message: `Dear ${recipientName},<br><br>You have been requested to verify the acceptance of your group life insurance quote.<br><br>Your secure OTP is: <b style="font-size: 24px; color: #0070c0;">${otpCode}</b><br><br>This code is valid for <b>5 minutes</b> and will be blocked after 3 failed attempts.`,
    });

    logger.info(`Stateless cached OTP dispatched to ${targetEmail} for ${referenceType} ${referenceId}`);

    return res.status(200).json({
      success: true,
      message: "A secure verification code has been sent to the employer's email.",
      data: { expiresAt },
    });
  } catch (error: any) {
    logger.error("SEND OTP API ERROR:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An unexpected error occurred while sending the OTP.",
      errors: error.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
    });
  }
};

/**
 * @swagger
 * /broker/otp/verify:
 *   post:
 *     summary: Statelessly verify OTP via API gateway and trigger onboarding workflow
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referenceId
 *               - otpCode
 *             properties:
 *               referenceId:
 *                 type: string
 *                 description: The UUID of the Lead or Quote
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
  const { BrokerQuote, BrokerLead, sequelize } = getModels();

  try {
    const validatedBody = await verifyOtpSchema.validate(req.body, { abortEarly: false });
    const { referenceId, otpCode } = validatedBody;

    // Resolve canonical reference ID statelessly
    let canonicalReferenceId = referenceId;
    let referenceType = "Lead";

    const quoteCheck = await BrokerQuote.findOne({
      where: {
        [Op.or]: [
          { quote_id: referenceId },
          { quote_reference: referenceId },
        ],
      },
    });

    if (quoteCheck) {
      canonicalReferenceId = quoteCheck.quote_id;
      referenceType = "Quote";
    } else {
      const leadCheck = await BrokerLead.findOne({
        where: {
          [Op.or]: [
            { lead_id: referenceId },
            { lead_reference: referenceId },
          ],
        },
      });
      if (leadCheck) {
        canonicalReferenceId = leadCheck.lead_id;
      }
    }

    let isVerified = false;

    // Allow static bypass logic in development workflows to preserve verification cycle efficiency
    if ((process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && otpCode === "123456") {
      logger.info(`[MOCK BYPASS] Instant stateless OTP approval granted for reference ${referenceId}`);
      isVerified = true;
    } else {
      // Verify against volatile in-memory caching layer
      const cachedOtp: any = cache.get(`otp_${canonicalReferenceId}`);
      if (!cachedOtp) {
        return res.status(400).json({
          success: false,
          message: "No active verification request found or code expired. Please request a new code.",
        });
      }

      if (cachedOtp.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "This verification code has been blocked due to too many failed attempts. Please request a new one.",
        });
      }

      if (cachedOtp.otpCode !== otpCode) {
        cachedOtp.attempts += 1;
        const shouldBlock = cachedOtp.attempts >= 3;
        cachedOtp.isBlocked = shouldBlock;
        cache.set(`otp_${canonicalReferenceId}`, cachedOtp, 300);

        const remaining = 3 - cachedOtp.attempts;
        return res.status(400).json({
          success: false,
          message: shouldBlock
            ? "Too many failed attempts. This code is now blocked."
            : `Invalid OTP. You have ${remaining} attempts remaining.`,
        });
      }

      // Successful local stateless verification
      cache.del(`otp_${canonicalReferenceId}`);
      isVerified = true;
    }

    if (isVerified) {
      // Execute persistent state transition and trigger associated background onboarding tasks atomically
      const t = await sequelize.transaction();
      let triggerOnboarding = false;
      let leadIdToOnboard = "";

      try {
        if (referenceType === "Quote") {
          const quoteToAccept = await BrokerQuote.findByPk(canonicalReferenceId, { transaction: t });
          if (quoteToAccept) {
            await quoteToAccept.update(
              {
                quote_status: "Accepted",
                employer_accepted_at: new Date(),
                employer_accepted_by_otp: true,
              },
              { transaction: t }
            );

            await BrokerLead.update(
              { lead_status: "Accepted" },
              { where: { lead_id: quoteToAccept.lead_id }, transaction: t }
            );

            triggerOnboarding = true;
            leadIdToOnboard = quoteToAccept.lead_id;
          }
        } else {
          await BrokerLead.update(
            { lead_status: "Accepted" },
            { where: { lead_id: canonicalReferenceId }, transaction: t }
          );
          triggerOnboarding = true;
          leadIdToOnboard = canonicalReferenceId;
        }

        await t.commit();
        logger.info(`Stateless OTP Verified and persistent state committed for reference ${referenceId}`);
      } catch (dbError) {
        await t.rollback();
        throw dbError;
      }

      // Asynchronously trigger automatic onboarding request generation
      if (triggerOnboarding && leadIdToOnboard) {
        try {
          await BrokerOnboardingService.createOnboardingRequestFromLead(
            leadIdToOnboard,
            "Processing",
            "VOPD/AML Verification: Scheduled for Backend Processing"
          );
          logger.info(`Automatic Onboarding successfully triggered for Lead: ${leadIdToOnboard}`);
        } catch (onboardingError) {
          logger.error(`Automatic Onboarding generation failed for Lead ${leadIdToOnboard}:`, onboardingError);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Quote accepted successfully. The onboarding process has been initiated.",
        data: {
          status: "Accepted",
          timestamp: new Date(),
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Verification failed due to unknown error.",
    });
  } catch (error: any) {
    logger.error("VERIFY OTP API ERROR:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "Verification failed. Please contact support.",
    });
  }
};