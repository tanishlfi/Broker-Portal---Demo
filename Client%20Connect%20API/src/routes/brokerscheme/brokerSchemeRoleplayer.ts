import { Router } from "express";
import {
  createBrokerSchemeRoleplayer,
  getBrokerSchemeRoleplayerById,
} from "../../controllers/brokerScheme";

const router = Router();

router
  .route("/roleplayer/:scheme_id")
  .post(createBrokerSchemeRoleplayer)
  .get(getBrokerSchemeRoleplayerById);

router;

export default router;
