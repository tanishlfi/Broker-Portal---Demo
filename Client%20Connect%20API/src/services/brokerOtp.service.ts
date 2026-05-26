const { sequelize } = require("../models");
import { BrokerQuoteRepository } from "../repositories/brokerQuote.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { BrokerOtpRepository } from "../repositories/brokerOtp.repository";
import { sendBrokerEmail } from "../utils/brokerSendEmail";
import { AuditService } from "./auditService";
import { AuditEventType, ActionOutcome, LeadStatus, OTPStatus } from "../enums/brokerPortalEnums";
import { v4 as uuidv4 } from "uuid";

const quoteRepo = new BrokerQuoteRepository();
const leadRepo = new BrokerLeadRepository();
const otpRepo = new BrokerOtpRepository();

export class BrokerOtpService {
  async sendOTP(data: any) {
    const t = await sequelize.transaction();
    try {
      const { quoteId } = data;
      let targetEmail = "";
      let recipientName = "";

      const quote = await quoteRepo.findById(quoteId, {
        include: [{ 
          model: require("../models").BrokerLead, as: "lead", 
          include: [{ model: require("../models").BrokerContact, as: "contact" }] 
        }],
        transaction: t
      });

      if (!quote || !quote.lead || !quote.lead.contact) {
        throw new Error("Quote or associated contact not found");
      }
      targetEmail = quote.lead.contact.contact_email;
      recipientName = `${quote.lead.contact.contact_first_name} ${quote.lead.contact.contact_last_name}`;

      // Mark previous active OTPs as Expired
      await otpRepo.updateMany(
        { reference_id: quoteId, otp_status: { [require("sequelize").Op.in]: [OTPStatus.GENERATED, OTPStatus.SENT] } },
        { otp_status: OTPStatus.EXPIRED, otp_expiry: new Date() },
        t
      );

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Create with status "Generated"
      const otpRecord = await otpRepo.create({
        otp_id: uuidv4(),
        reference_id: quoteId,
        otp_code: otpCode,
        otp_expiry: expiresAt,
        sent_to: targetEmail,
        sent_method: "Email",
        otp_status: OTPStatus.GENERATED,
      }, t);

      await sendBrokerEmail({
        email: targetEmail,
        recipientName,
        subject: "Action Required: Your Secure OTP",
        title: "Quote Verification Code",
        message: `Dear ${recipientName},<br><br>Your secure OTP is: <b style="font-size: 24px;">${otpCode}</b>`
      });

      // Update status to "Sent" after email success
      await otpRecord.update({ otp_status: OTPStatus.SENT }, { transaction: t });

      // Update Lead and Quote status to "Awaiting Employer Acceptance"
      await leadRepo.update(quote.lead_id, { lead_status: LeadStatus.AWAITING_EMPLOYER_ACCEPTANCE }, t);
      await quoteRepo.update(quoteId, { quote_status: LeadStatus.AWAITING_EMPLOYER_ACCEPTANCE }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.NOTIFICATION_SENT,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId,
        metadata: { quoteId, type: "OTP", method: "Email" },
        ipAddress: data.ipAddress
      });

      return { expiresAt };
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.NOTIFICATION_SENT,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteId: data.quoteId, error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async verifyOTP(data: any) {
    const t = await sequelize.transaction();
    try {
      const { quoteId, otpCode } = data;
      const otpRecord = await otpRepo.findActiveOtp(quoteId, t);

      if (!otpRecord) throw new Error("No active verification request found.");

      // Check Expiry
      if (new Date() > otpRecord.otp_expiry) {
        await otpRecord.update({ otp_status: OTPStatus.EXPIRED }, { transaction: t });
        await t.commit();
        throw new Error("Verification code has expired.");
      }

      if (otpRecord.otp_code !== otpCode) {
        await otpRecord.update({ otp_status: OTPStatus.FAILED }, { transaction: t });
        await t.commit();
        throw new Error("Invalid verification code. This code has been invalidated for security.");
      }

      await otpRecord.update({ otp_status: OTPStatus.VERIFIED }, { transaction: t });
      
      const quote = await quoteRepo.findById(quoteId, { transaction: t });
      if (quote) {
        await quote.update({ quote_status: LeadStatus.ACCEPTED, employer_accepted_at: new Date() }, { transaction: t });
        await leadRepo.update(quote.lead_id, { lead_status: LeadStatus.ACCEPTED }, t);
        
        await t.commit();

        await AuditService.logEvent({
          eventType: AuditEventType.OTP_VERIFIED,
          outcome: ActionOutcome.SUCCESS,
          userId: data.representativeId,
          metadata: { quoteId, leadId: quote.lead_id },
          ipAddress: data.ipAddress
        });

      } else {
        await t.rollback();
        throw new Error("Quote not found during verification.");
      }

      return true;
    } catch (error: any) {
      if (t && !t.finished) await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.OTP_VERIFIED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteId: data.quoteId, error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }
}

