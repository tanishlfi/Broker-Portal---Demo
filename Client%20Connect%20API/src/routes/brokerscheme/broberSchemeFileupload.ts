import { Router } from "express";
import fileUpload from "express-fileupload";
import {
  brokerSchemeFileUpload,
  downloadBrokerSchemeUpload,
  getAllBrokerSchemeUploads,
} from "../../controllers/brokerSchemeFileUpload";

const router = Router();

router.route("/file_upload/download/:id").get(downloadBrokerSchemeUpload);

router
  .use(fileUpload())
  .route("/file_upload/:scheme_id")
  .post(brokerSchemeFileUpload)
  .get(getAllBrokerSchemeUploads);

export default router;
