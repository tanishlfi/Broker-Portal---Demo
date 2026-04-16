import { Router } from "express";
import {
  createBrokerBankingDetails,
  getBrokerBankingDetailsById,
  getAllBrokerBankingDetails,
} from "../../controllers/brokerSchemeBankingDetails";

const router = Router();

router.route("/banking/:scheme_id").get(getAllBrokerBankingDetails);

router
  .route("/scheme/:scheme_id/banking")
  .post(createBrokerBankingDetails)
  .get(getBrokerBankingDetailsById);

export default router;
