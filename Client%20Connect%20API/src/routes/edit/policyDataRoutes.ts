import {
  createEditRequest,
  getEditRequests,
  getEditRequest,
  updateEditRequest,
  deleteEditRequest,
  updatePolicyData,
  getApprovers,
  submitEditRequest,
  getAllApprovers,
} from "../../controllers/editsController";
import fileUpload from "express-fileupload";
import { Router } from "express";

const router = Router();

router.use(fileUpload()).route("/requests").post(createEditRequest);

router.route("/requests").get(getEditRequests);

router.route("/requests/:id/policyData").put(updatePolicyData);
router.route("/requests/:id/approvers").get(getApprovers);
router.route("/requests/allApprovers").get(getAllApprovers);
router.route("/requests/:id/submit").patch(submitEditRequest);
router.use(fileUpload()).route("/requests/:id").put(updateEditRequest);
router.route("/requests/:id").get(getEditRequest).delete(deleteEditRequest);

export default router;
