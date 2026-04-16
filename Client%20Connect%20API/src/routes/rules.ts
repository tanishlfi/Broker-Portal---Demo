import { Router } from "express";
import {
  getOptionsByProductOptionIdController,
  BenefitsByProductionOptionIdController,
} from "../controllers/rulesControllerOrg";
import {
  createBenefitConfiguration,
  getBenefitAmountByProductOptionIdController,
  getBenefitConfigurations,
} from "../controllers/rulesControllers";

const router = Router();

router
  .route("/rules/benefit/GetBenefitAmount/:productOptionId")
  .get(getBenefitAmountByProductOptionIdController);

// probably this route is not needed
router
  .route("/rules/benefitOptions/:productOptionId")
  .get(getOptionsByProductOptionIdController);

// probably this route is not needed
router
  .route("/rules/benefits/:productOptionId")
  .get(BenefitsByProductionOptionIdController);

// for Benefit Management data
router.post("/rules/benefitConfiguration", createBenefitConfiguration);
router.get("/rules/benefitConfiguration", getBenefitConfigurations);
export default router;
