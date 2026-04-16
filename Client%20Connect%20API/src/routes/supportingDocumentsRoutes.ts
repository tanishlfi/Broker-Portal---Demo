import { Router } from "express";
import {
  supportingDocumentsDownloadController,
  addSupportingDocuments,
  getSupportingDocuments,
  addPolicyDocuments,
  getPolicyDocuments,
  policyDocumentsDownloadController,
  // addMultiDocuments,
} from "../controllers/supporting_documents";
import fileUpload from "express-fileupload";

const router = Router();

// set routes
router
  .use(fileUpload())
  .route("/supportingDocuments")
  .post(addSupportingDocuments);

// may one day need it
// router
//   .use(fileUpload())
//   .route("/supportingDocumentsMulti")
//   .post(addMultiDocuments);

router
  .route("/supportingDocuments/:fileId")
  .get(supportingDocumentsDownloadController);

router
  .route("/policyDocuments/download/:id")
  .get(policyDocumentsDownloadController);

router
  .route("/policyDocuments/:id")
  .get(getPolicyDocuments)
  .post(addPolicyDocuments);

export default router;
