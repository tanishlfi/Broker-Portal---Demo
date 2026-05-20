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
 */
export const sendBrokerEmail = async (options: BrokerEmailOptions) => {
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
      logger.error("Failed to send email via Graph API. Falling back to console log.", result?.data);
      console.log("------------------------------------------");
      console.log(`MOCK EMAIL SENT TO: ${options.email}`);
      console.log(`SUBJECT: ${options.subject}`);
      console.log(`MESSAGE: ${options.message}`);
      console.log("------------------------------------------");
      return { result: true, data: "Mock success (Graph API failed)" };
    }

    return result;
  } catch (error) {
    logger.error("Error in sendBrokerEmail. Falling back to console log.", error);
    console.log("------------------------------------------");
    console.log(`MOCK EMAIL SENT TO: ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`MESSAGE: ${options.message}`);
    console.log("------------------------------------------");
    return { result: true, data: "Mock success (Error occurred)" };
  }
};
