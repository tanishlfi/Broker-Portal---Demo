import {
  fileUploadController,
  getAllFileUploadEntriesController,
  fileDownloadController,
  getFileController,
  updateFileStatusController,
  fileDownloadControllerType,
  deleteFileController,
  getFileByUniqueId,
  createFileAction,
  getFileActions,
  updateFileAction,
} from "../../controllers/filesController";

import { Router } from "express";
import fileUpload from "express-fileupload";

const router = Router();

router.route("/files/unique/:uniqueId").get(getFileByUniqueId);

router.route("/file_upload/download/:id").get(fileDownloadController);

router
  .route("/file_upload/:productType?")
  .get(getAllFileUploadEntriesController);

router.use(fileUpload()).route("/file_upload").post(fileUploadController);

router.route("/fileDownload/:id/:type").get(fileDownloadControllerType);

router
  .route("/files/:id")
  .get(getFileController)
  .patch(updateFileStatusController)
  .delete(deleteFileController);

router.route("/fileAction").post(createFileAction);
router.route("/fileAction/:fileId").get(getFileActions);
router.route("/fileAction/:id").put(updateFileAction);

export default router;
