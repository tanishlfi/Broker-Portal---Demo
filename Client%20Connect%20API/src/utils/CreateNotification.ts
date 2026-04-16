const { notifications } = require("../models");

interface Notification {
  from_user_email: string;
  to_user_email?: string;
  variant: "app" | "email";
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
}

export const CreateNotification = async (data: Notification) => {
  try {
    const newNotification = await notifications.create(data);
    return newNotification;
  } catch (error) {
    console.log(error);
    return error;
  }
};
