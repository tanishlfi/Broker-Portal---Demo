import { Router } from "express";
import {
  createUserMetaData,
  getUserMetaData,
  updateUserMetaData,
} from "../controllers/appMetaData";

const router = Router();

// users routes

router.route("/AppMetaData").post(createUserMetaData);

router.route("/AppMetaData/:id").get(getUserMetaData).put(updateUserMetaData);

export default router;
