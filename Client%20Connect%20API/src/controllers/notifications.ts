import { Request, Response } from "express";
import { sendEmail } from "../utils/sendEmail";
import { emailNotificationTemplate } from "../utils/emailTemplates";
import * as yup from "yup";
const { notifications } = require("../models");

interface Notification {
  to_user_email: string;
  from_user_email: string;
  title: string;
  message: string;
  type: string;
  link: string;
  variant: string;
}

const notificationValidationSchema = yup.object().shape({
  to_user_email: yup.string().required("To user email is required"),
  from_user_email: yup.string().required("From user email is required"),
  title: yup.string().required("Title is required"),
  message: yup.string().required("Message is required"),
  type: yup.string().required("Type is required"),
  link: yup.string().nullable(),
  variant: yup.string().required("Variant is required"),
});

export const createNotification = async (req: Request, res: Response) => {
  try {
    const notificationBody: Notification = {
      to_user_email: req.body.to_user_email,
      from_user_email: req.body.from_user_email,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type,
      link: req.body.link,
      variant: req.body.variant,
    };

    await notificationValidationSchema.validate(notificationBody, {
      abortEarly: false,
    });

    const newNotification = await notifications.create(req.body);
    return res.status(200).json({
      success: true,
      message: "Notification created successfully",
      data: newNotification,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred unable to create notification",
      err,
    });
  }
};

export const getNotificationForUser = async (req: Request, res: Response) => {
  try {
    const { to_user_email } = req.params;
    const { read } = req.query;

    let where = {};
    if (read === "true") {
      where = {
        to_user_email: to_user_email,
        read: false,
      };
    } else {
      where = {
        to_user_email: to_user_email,
      };
    }

    const notificationsData = await notifications.findAll({
      where,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications found",
      data: notificationsData,
    });
  } catch (err) {
    console.log("Get Notification Error", err);
    res.status(400).json({
      success: false,
      message: "Error occurred unable to find notifications",
      err,
    });
  }
};

export const readNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedNotification = await notifications.update(
      {
        read: true,
      },
      { where: { id: id }, returning: true },
    );

    return res.status(200).json({
      success: true,
      message: "Notifications found",
      data: updatedNotification,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred unable to find notifications",
      err,
    });
  }
};

export const emailNotification = async (req: Request, res: Response) => {
  try {
    const {
      to_user_email,
      from_user_email,
      title,
      message,
      type,
      link,
      variant,
    } = req.body;

    const newNotification = await notifications.create({
      to_user_email,
      from_user_email,
      title: title,
      message: message,
      type: type,
      link: link,
      variant: variant,
    });

    const email = sendEmail({
      email: to_user_email,
      subject: title,
      message: emailNotificationTemplate({
        title: title,
        message: message,
        type: type,
        link: link,
        variant: variant,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Email Successfully Sent",
      data: newNotification,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred unable to find notifications",
      err,
    });
  }
};
