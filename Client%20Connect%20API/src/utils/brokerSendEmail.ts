import { sendEmailWithGraphApi } from "./sendEmail";
import { emailNotificationTemplate } from "./emailTemplates";
import { logger } from "../middleware/logger";

interface BrokerEmailOptions {
  email: string;
  subject: string;
  title: string;
  message: string;
  recipientName: string;
}

/**
 * Sends an email using the Microsoft Graph API (the "current way")
 * This avoids the mock fallback in the standard sendEmail utility.
 * In development/bypass mode, logs to console instead of calling Graph API.
 */
export const sendBrokerEmail = async (options: BrokerEmailOptions) => {
  // In non-production or bypass mode, skip the live Microsoft Graph API call
  // and just log the email content to the console so OTP can be read during development.
  if (
    process.env.BYPASS_AUTH === "true" ||
    (process.env.NODE_ENV as string) !== "production"
  ) {
    logger.info(`[DEV EMAIL BYPASS] To: ${options.email} | Subject: ${options.subject}`);
    logger.info(`[DEV EMAIL BYPASS] ${options.message}`);
    console.log("\n==============================");
    console.log(`📧 DEV EMAIL (not sent): To: ${options.email}`);
    console.log(`📧 Subject: ${options.subject}`);
    console.log(`📧 Message: ${options.message}`);
    console.log("==============================\n");
    return { result: true, data: "Email bypassed in development mode" };
  }

  try {
    const htmlMessage = emailNotificationTemplate({
      title: options.title,
      message: options.message,
      type: "info",
      link: "",
      variant: "email"
    });

    const result = await sendEmailWithGraphApi(
      options.email,
      options.subject,
      htmlMessage,
      "HTML"
    );

    if (!result?.result) {
      throw new Error(result?.data || "Failed to send email via Graph API");
    }

    return result;
  } catch (error) {
    logger.error("Error in sendBrokerEmail:", error);
    throw error;
  }
};
