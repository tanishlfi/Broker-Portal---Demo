import { Request, Response } from "express";
const { BrokerOTP, BrokerQuote, BrokerLead, BrokerContact, sequelize } = require("../models");
import { sendEmail } from "../utils/sendEmail";
import { emailNotificationTemplate } from "../utils/emailTemplates";
import { sendOtpSchema, verifyOtpSchema } from "../utils/validation";
import { v4 as uuidv4 } from "uuid";
import { BrokerOnboardingService } from "../services/broker.onboarding.service";
import { performBulkVerification } from "../services/broker.verification.service";
import { logger } from "../middleware/logger";
import { Op } from "sequelize";


export const sendOTP = async (req: Request, res: Response) => {

  const t = await sequelize.transaction();
  try {
    const validatedBody = await sendOtpSchema.validate(req.body, { abortEarly: false });
    const { referenceId, referenceType } = validatedBody;

    let targetEmail = "";
    let recipientName = "";

    if (referenceType === "Quote") {
      const quote = await BrokerQuote.findByPk(referenceId, {
        include: [{ 
          model: BrokerLead, as: "lead", 
          include: [{ model: BrokerContact, as: "contact" }] 
        }]
      });
      if (!quote || !quote.lead || !quote.lead.contact) {
        if (t) await t.rollback();
        return res.status(404).json({ success: false, message: "Quote or associated contact not found" });
      }
      targetEmail = quote.lead.contact.contact_email;
      recipientName = `${quote.lead.contact.contact_first_name} ${quote.lead.contact.contact_last_name}`;
    } else if (referenceType === "Lead") {
      const lead = await BrokerLead.findByPk(referenceId, {
        include: [{ model: BrokerContact, as: "contact" }]
      });
      if (!lead || !lead.contact) {
        if (t) await t.rollback();
        return res.status(404).json({ success: false, message: "Lead or contact not found" });
      }
      targetEmail = lead.contact.contact_email;
      recipientName = `${lead.contact.contact_first_name} ${lead.contact.contact_last_name}`;
    }

    await BrokerOTP.update(
      { is_verified: false, expires_at: new Date() },
      { 
        where: { reference_id: referenceId, is_verified: false },
        transaction: t 
      }
    );

    // 3. Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newOtp = await BrokerOTP.create({
      otp_id: uuidv4(),
      reference_id: referenceId,
      reference_type: referenceType,
      otp_code: otpCode,
      expires_at: expiresAt,
      sent_to: targetEmail,
      sent_method: "Email",
      attempts: 0,
      is_blocked: false
    }, { transaction: t });

    // 4. Send Email using existing infrastructure
    await sendEmail({
      email: targetEmail,
      subject: "Action Required: Your Secure OTP for Quote Acceptance",
      message: emailNotificationTemplate({
        title: "Quote Verification Code",
        message: `Dear ${recipientName},<br><br>You have been requested to verify the acceptance of your group life insurance quote.<br><br>Your secure OTP is: <b style="font-size: 24px; color: #0070c0;">${otpCode}</b><br><br>This code is valid for <b>5 minutes</b> and will be blocked after 3 failed attempts.`,
        type: "info",
        link: "",
        variant: "email"
      })
    });

    await t.commit();
    logger.info(`OTP sent to ${targetEmail} for ${referenceType} ${referenceId}`);

    return res.status(200).json({
      success: true,
      message: "A secure verification code has been sent to the employer's email.",
      data: { expiresAt }
    });
  } catch (error: any) {
    if (t) await t.rollback();
    logger.error("SEND OTP ERROR:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({ 
      success: false, 
      message: error.message || "An unexpected error occurred while sending the OTP.",
      errors: error.inner?.map((e: any) => ({ field: e.path, message: e.message })) || []
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const validatedBody = await verifyOtpSchema.validate(req.body, { abortEarly: false });
    const { referenceId, otpCode } = validatedBody;

    const otpRecord = await BrokerOTP.findOne({
      where: {
        reference_id: referenceId,
        is_verified: false,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [["created_at", "DESC"]],
      transaction: t,
      lock: true 
    });

    if (!otpRecord) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "No active verification request found. Please request a new code." });
    }

    if (otpRecord.is_blocked) {
      await t.rollback();
      return res.status(403).json({ success: false, message: "This verification code has been blocked due to too many failed attempts. Please request a new one." });
    }

    if (otpRecord.otp_code !== otpCode) {
      const newAttempts = otpRecord.attempts + 1;
      const shouldBlock = newAttempts >= 3;
      
      await otpRecord.update({
        attempts: newAttempts,
        is_blocked: shouldBlock,
        last_attempt_at: new Date()
      }, { transaction: t });

      await t.commit();
      
      const remaining = 3 - newAttempts;
      return res.status(400).json({ 
        success: false, 
        message: shouldBlock 
          ? "Too many failed attempts. This code is now blocked." 
          : `Invalid OTP. You have ${remaining} attempts remaining.` 
      });
    }

    await otpRecord.update({ 
      is_verified: true,
      last_attempt_at: new Date()
    }, { transaction: t });

    await BrokerOTP.destroy({
      where: {
        reference_id: referenceId,
        otp_id: { [Op.ne]: otpRecord.otp_id }
      },
      transaction: t
    });

    let triggerOnboarding = false;
    let leadIdToOnboard = "";

    if (otpRecord.reference_type === "Quote") {
      const quote = await BrokerQuote.findByPk(referenceId, { transaction: t });
      if (quote) {
        await quote.update({
          quote_status: "Accepted",
          employer_accepted_at: new Date(),
          employer_accepted_by_otp: true
        }, { transaction: t });

        await BrokerLead.update(
          { lead_status: "Accepted" },
          { where: { lead_id: quote.lead_id }, transaction: t }
        );
        
        triggerOnboarding = true;
        leadIdToOnboard = quote.lead_id;
      }
    } else if (otpRecord.reference_type === "Lead") {
      await BrokerLead.update(
        { lead_status: "Accepted" },
        { where: { lead_id: referenceId }, transaction: t }
      );
      triggerOnboarding = true;
      leadIdToOnboard = referenceId;
    }

    if (triggerOnboarding && leadIdToOnboard) {
      logger.info(`Triggering synchronous VOPD/AML verifications for Lead: ${leadIdToOnboard}`);
      await performBulkVerification(leadIdToOnboard, t);
    }

    await t.commit();
    logger.info(`OTP Verified for ${otpRecord.reference_type} ${referenceId}`);

    if (triggerOnboarding && leadIdToOnboard) {
      try {
        const onboardingResult = await BrokerOnboardingService.createOnboardingRequestFromLead(
          leadIdToOnboard,
          "Verification_In_Progress",
          "VOPD/AML Verification: Started"
        );
        logger.info(`Automatic Onboarding triggered for Lead: ${leadIdToOnboard}`);

        performBulkVerification(leadIdToOnboard, onboardingResult.policyId).catch((err) => {
          logger.error(`Background verification failed for Lead ${leadIdToOnboard}:`, err);
        });

      } catch (onboardingError) {
        logger.error(`Automatic Onboarding failed for Lead ${leadIdToOnboard}:`, onboardingError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Quote accepted successfully. The onboarding process has been initiated.",
      data: {
        status: "Accepted",
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    if (t && !t.finished) await t.rollback();
    logger.error("VERIFY OTP ERROR:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({ 
      success: false, 
      message: error.message || "Verification failed. Please contact support." 
    });
  }
};


