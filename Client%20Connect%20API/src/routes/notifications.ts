import { Router } from "express";
import {
  createNotification,
  emailNotification,
  getNotificationForUser,
  readNotification,
} from "../controllers/notifications";

const router = Router();

// set routes
router.route("/notifications/read/:id").get(readNotification);
router.route("/notifications/:to_user_email").get(getNotificationForUser);
router.route("/notifications").post(createNotification);
router.route("/notifications/email").post(emailNotification);

export default router;
