import {
  createPolicy,
  deletePolicy,
  getAllPoliciesSchemeOrRep,
  getPolicy,
  updatePolicy,
  createPolicyNoValidation,
  bulkUpdatePolicies,
  editPolicy,
  editPolicyNoValidation,
} from "../../controllers/policyDataController";
import { Router } from "express";

const router = Router();

router.route("/policies").post(createPolicy).get(getAllPoliciesSchemeOrRep);

router.route("/policies/save").post(createPolicyNoValidation);
router.route("/policies/bulkUpdateStatus").post(bulkUpdatePolicies);
router.route("/policies/:id/save").post(editPolicyNoValidation);
router.route("/policies/:id").post(editPolicy);

router
  .route("/policies/:policyId")
  .get(getPolicy)
  .patch(updatePolicy)
  .delete(deletePolicy);

export default router;
