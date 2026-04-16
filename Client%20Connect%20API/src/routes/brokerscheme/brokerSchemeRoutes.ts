import { Router } from "express";
import {
  GetAllBrokerSchemes,
  createBrokerScheme,
  getSchemeById,
  createBrokerCollectionDetails,
  getBrokerSchemeCollectionDetailById,
  getAllViewchemes,
  getAllSchemes,
  updateScheme,
  GetAllNewScheme,
} from "../../controllers/brokerScheme";

const router = Router();

router.route("/scheme/:id").get(getSchemeById).put(updateScheme);

router.route("/newSchemes").get(GetAllNewScheme);

router
  .route("/scheme/:BrokerageId/broker")
  .get(GetAllBrokerSchemes)
  .post(createBrokerScheme);

router
  .route("/scheme/:scheme_id/details")
  .post(createBrokerCollectionDetails)
  .get(getBrokerSchemeCollectionDetailById);

router.route("/scheme/view/:id").get(getAllViewchemes);
router.route("/scheme").get(getAllSchemes);

export default router;
