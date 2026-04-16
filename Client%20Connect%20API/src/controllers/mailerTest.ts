import { Request, Response } from "express";
import { sendEmailWithGraphApi } from "../utils/sendEmail";

export const mailerTest = async (req: Request, res: Response) => {
  try {
    const { email, subject, message } = req.body;
    const emailResult = await sendEmailWithGraphApi(email, subject, message);
    if (emailResult?.result === false) {
      return res.status(500).json({
        status: false,
        message: "Error sending email",
        error: emailResult?.data,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Email sent successfully",
      data: emailResult,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error sending email",
    });
  }
};
