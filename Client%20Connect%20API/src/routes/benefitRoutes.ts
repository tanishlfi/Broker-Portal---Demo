import { Router } from "express";
import { getBenefitsByProductionOptionIdController } from "../controllers/rulesControllers";
import { getBenefitAmountByProductOptionIdController } from "../controllers/rulesControllers";

const router = Router();

router
  .route("/benefits/:productOptionId/GetBenefitAmount")
  .get(getBenefitAmountByProductOptionIdController);

router
  .route("/benefits/:productOptionId")
  .get(getBenefitsByProductionOptionIdController);

export default router;
