import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  brokerSchemeFileUpload,
  deleteFile,
  downloadBrokerSchemeUpload,
  getAllBrokerSchemeUploads,
} from "../../controllers/brokerSchemeFileUpload";

const router = Router();

router
  .route("/file_upload/download/:id")
  .get(downloadBrokerSchemeUpload)
  .delete(deleteFile);

router
  .route("/file_upload/getFiles/:id/:DocumentType")
  .get(getAllBrokerSchemeUploads);

router
  .use(fileUpload())
  .route("/file_upload/:scheme_id")
  .post(brokerSchemeFileUpload);

export default router;
