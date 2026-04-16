import {
  createPolicy,
  deletePolicy,
  getAllPoliciesSchemeOrRep,
  getPolicyByPolicyId,
  getPolicyByPolicyNumber,
  updatePolicy,
  createPolicyNoValidation,
} from "../../controllers/policyDataControllerOrg";
import {
  getAllEdits,
  createEditPolicy,
  getPolicy,
  updateEditPolicy,
} from "../../controllers/administrationController";
import { Router } from "express";

const router = Router();

router.route("/policies").post(createEditPolicy).get(getAllEdits);

router.route("/policies/save").post(createPolicyNoValidation);

router
  .route("/policies/ByPolicyNumber/:policyNumber")

  .get(getPolicyByPolicyNumber);

router.route("/policies/ByPolicyId/:policyId").get(getPolicyByPolicyId);

router.route("/policy/:id").put(updateEditPolicy);

router
  .route("/policies/:policyId")
  .get(getPolicy)
  .patch(updatePolicy)
  .delete(deletePolicy);

export default router;
