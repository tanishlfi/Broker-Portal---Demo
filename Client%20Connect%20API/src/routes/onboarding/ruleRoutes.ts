// to deprecate

import express from "express";
import {
  updateBenefitController,
  createBenefitController,
  getMemberBenefitRuleByIdController,
  getBenefitByBenefitIdController,
  getAllMemberBenefitRulesController,
  updateChildBenefitController,
  createChildBenefitController,
  getChildBenefitByIdController,
  getAllChildBenefitsController,
  getAllFamilyBenefitsController,
  getFamilyBenefitByIdController,
  createFamilyBenefitController,
  getAllBenefitRulesController,
  getBenefitRuleByIdController,
  getBenefitRuleByBenefitIdController,
  createBenefitRuleController,
  searchBenefitRuleController,
  getAllMemberBenefitRulesByProductOptionController,
  getAllMemberBenefitRulesByBenefitIdController,
  getRMABenefitsByProductOptionIdController,
  getBenefitsByProductionOptionIdController,
} from "../../controllers/rulesControllerOrg";

import { confirmToken } from "../../middleware/auth";
import { getRmaAccessToken } from "../../middleware/getRmaToken";

import {
  // validateMemberBenfitsController,
  allocateMemberBenefitController,
} from "../../controllers/validateBenefitsController";

const router = express.Router();

router
  .route("/global/rules/member_benefit_rules")
  .get(getAllMemberBenefitRulesController)
  .post(createBenefitController);

router
  .route("/global/rules/member_benefit_rules/:id")
  .get(getMemberBenefitRuleByIdController)
  .post(updateBenefitController);

router.route("/rmaBenefits/:benefitId").get(getBenefitByBenefitIdController);
//.post(updateBenefitController)

router
  .route("/child_benefits")
  .get(getAllChildBenefitsController)
  .post(createChildBenefitController);

router.route("/child_benefits/:id").get(getChildBenefitByIdController);
//.post(createChildBenefitController)

router
  .route("/family_benefits")
  .get(getAllFamilyBenefitsController)
  .post(createFamilyBenefitController);

router
  .route("/family_benefits/:id")
  .get(getFamilyBenefitByIdController)
  .post(createFamilyBenefitController);

router
  .route("/benefit_rules")
  .get(getAllMemberBenefitRulesController)
  .post(createBenefitRuleController);

router.route("/benefit_rules/search").get(searchBenefitRuleController);

router.route("/benefit_rules/allocation").post(allocateMemberBenefitController);

// deprecated this route 20230704 Lourens
router
  .route("/benefit_rules/rma/:benefitId")
  .get(getAllMemberBenefitRulesByBenefitIdController);
//   .post(validateMemberBenfitsController);

router
  .route("/benefit_rules/benefits/:productOptionId{/:selectedCategory}")
  .get(getBenefitsByProductionOptionIdController);

router
  .route(
    "/benefit_rules/ByProductOptionId/:productOptionId{/:selectedCategory}",
  )
  .get(getAllMemberBenefitRulesByProductOptionController);

router
  .route("/ProductOptions/:productOptionId{/:benefitAmount}")
  .get(getRMABenefitsByProductOptionIdController);

router.route("/benefit_rules/:id").get(getBenefitRuleByIdController);

export default router;
