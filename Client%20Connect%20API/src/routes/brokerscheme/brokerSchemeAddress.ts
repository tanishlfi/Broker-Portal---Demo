import { Router } from "express";
import {
  createBrokerSchemeAddress,
  getBrokerAddressById,
  getAllBrokerAddress,
} from "../../controllers/brokerSchemeAddress";

const router = Router();

router.route("/address/:scheme_id").get(getAllBrokerAddress);

router
  .route("/scheme/:scheme_id/address")
  .post(createBrokerSchemeAddress)
  .get(getBrokerAddressById);

export default router;
