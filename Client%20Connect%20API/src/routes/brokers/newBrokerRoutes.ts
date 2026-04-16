import { Router } from "express";
import {
  CreateNewBrokerage,
  getCreatedBrokerage,
} from "../../controllers/broker";

const router = Router();

router.route("/:brokerUserId").get(getCreatedBrokerage);
router.route("/").post(CreateNewBrokerage);

export default router;
