const { sequelize } = require("../models");
import { BrokerQuoteRepository } from "../repositories/brokerQuote.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { BrokerOtpRepository } from "../repositories/brokerOtp.repository";
import { sendBrokerEmail } from "../utils/brokerSendEmail";
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

      await otpRepo.updateMany(
        { reference_id: quoteId, is_verified: false },
        { is_verified: false, expires_at: new Date() },
        t
      );

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await otpRepo.create({
        otp_id: uuidv4(),
        reference_id: quoteId,
        reference_type: "Quote",
        otp_code: otpCode,
        expires_at: expiresAt,
        sent_to: targetEmail,
        sent_method: "Email",
        status: "Sent",
      }, t);

      await sendBrokerEmail({
        email: targetEmail,
        recipientName,
        subject: "Action Required: Your Secure OTP",
        title: "Quote Verification Code",
        message: `Dear ${recipientName},<br><br>Your secure OTP is: <b style="font-size: 24px;">${otpCode}</b>`
      });

      // Update Lead and Quote status to "Awaiting Employer Acceptance"
      await leadRepo.update(quote.lead_id, { lead_status: "Awaiting Employer Acceptance" }, t);
      await quoteRepo.update(quoteId, { quote_status: "Awaiting Employer Acceptance" }, t);

      await t.commit();
      return { expiresAt };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async verifyOTP(data: any) {
    const t = await sequelize.transaction();
    try {
      const { quoteId, otpCode } = data;
      const otpRecord = await otpRepo.findActiveOtp(quoteId, t);

      if (!otpRecord) throw new Error("No active verification request found.");
      if (otpRecord.is_blocked) throw new Error("This code is blocked.");

      if (otpRecord.otp_code !== otpCode) {
        const newAttempts = otpRecord.attempts + 1;
        const isBlocked = newAttempts >= 3;
        await otpRecord.update({ 
          attempts: newAttempts, 
          is_blocked: isBlocked,
          status: isBlocked ? "Failed" : otpRecord.status 
        }, { transaction: t });
        await t.commit();
        throw new Error(isBlocked ? "Code blocked." : "Invalid OTP.");
      }

      await otpRecord.update({ is_verified: true, status: "Verified" }, { transaction: t });
      await otpRepo.deleteMany({ reference_id: quoteId, otp_id: { [require("sequelize").Op.ne]: otpRecord.otp_id } }, t);

      const quote = await quoteRepo.findById(quoteId, { transaction: t });
      if (quote) {
        await quote.update({ quote_status: "Accepted", employer_accepted_at: new Date() }, { transaction: t });
        await leadRepo.update(quote.lead_id, { lead_status: "Accepted" }, t);
        
        await t.commit();
      } else {
        await t.rollback();
        throw new Error("Quote not found during verification.");
      }

      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
