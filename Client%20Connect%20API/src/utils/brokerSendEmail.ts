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
      throw new Error(result?.data || "Failed to send email via Graph API");
    }

    return result;
  } catch (error) {
    logger.error("Error in sendBrokerEmail:", error);
    throw error;
  }
};
