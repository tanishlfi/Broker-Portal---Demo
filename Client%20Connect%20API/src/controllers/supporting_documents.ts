import { Request, Response } from "express";
import { checkDataLength } from "../lib/utils/fileUtils";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { downloadFileAZ, uploadFileAZ } from "../utils/azure_storage";
const { SupportDocument, PolicyDocuments } = require("../models");
const { Op } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { TableHints, where } from "sequelize";
import { logger } from "../middleware/logger";

// @desciption Controller to add supporting documents
export const addSupportingDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        status: false,
        message: "Can't upload empty file",
      });
    }
    const { file } = req.files;
    const { name: orgFile, data } = file as UploadedFile;
    const { documentType } = req.body;

    if (!checkDataLength(data)) {
      return res.status(400).json({
        status: false,
        message: "File is empty",
      });
    }

    if (!documentType) {
      return res.status(400).json({
        status: false,
        message: "Document type is required",
      });
    }

    // get filename extension from orgFile
    const fileName = `${uuidv4()}.${orgFile.split(".").pop()}`;
    const upload: boolean = await uploadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      String(process.env.RMA_SUPPORTDOCS_AZ_BLOB),
      fileName,
      data,
    );

    if (!upload) {
      return res.status(400).json({
        status: false,
        message: "Unable to upload file",
      });
    }

    const createdFile = await SupportDocument.create(
      {
        fileName: fileName,
        documentType: documentType,
        orgFileName: orgFile,
        createdBy: String(req?.auth?.payload?.user),
      },
      { returning: true },
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: createdFile.dataValues,
    });
  } catch (err: any) {
    //console.log(err)
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// to test multi upload
export const addMultiDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        status: false,
        message: "Can't upload empty file",
      });
    }

    // const { file } = req.files;

    const { documentType } = req.body;

    const files = Array.isArray(req.files.file)
      ? req.files.file
      : [req.files.file];
    const uploadedFiles = [];

    for (const f of files) {
      const { name: orgFile, data } = f as UploadedFile;

      if (!checkDataLength(data)) {
        return res.status(400).json({
          status: false,
          message: `File ${orgFile} is empty`,
        });
      }

      // get filename extension from orgFile
      const fileName = `${uuidv4()}.${orgFile.split(".").pop()}`;
      const upload: boolean = await uploadFileAZ(
        String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
        String(process.env.RMA_SUPPORTDOCS_AZ_BLOB),
        fileName,
        data,
      );

      if (!upload) {
        return res.status(400).json({
          status: false,
          message: `Unable to upload file ${orgFile}`,
        });
      }

      const createdFile = await SupportDocument.create(
        {
          fileName: fileName,
          documentType: documentType,
          orgFileName: orgFile,
          createdBy: String(req?.auth?.payload?.user),
        },
        { returning: true },
      );

      uploadedFiles.push(createdFile.dataValues);
    }

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getSupportingDocuments = async (req: Request, res: Response) => {
  try {
    const member = await SupportDocument.findAll({
      attributes: ["id", "fileName", "orgFileName"],
      tableHint: TableHints.NOLOCK,
    });

    return res.status(200).json({
      success: true,
      message: "Supporting document found",
      data: member,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const supportingDocumentsDownloadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const blobFileEntry = await SupportDocument.findOne({
      attributes: ["id", "fileName", "orgFileName"],
      where: {
        id: fileId,
      },
      tableHint: TableHints.NOLOCK,
    });

    if (!blobFileEntry) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    const result = await downloadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      String(process.env.RMA_SUPPORTDOCS_AZ_BLOB),
      blobFileEntry.fileName,
    );

    logger.debug(result);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    return res
      .status(200)
      .download(result, `${blobFileEntry.orgFileName}`, (err) => {
        if (err) {
          res.status(404);
        }
        // delete file
        fs.unlink(result, () => {
          console.log("File was deleted"); // Callback
        });
      });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      success: false,
      message: "Error occurred unable to download file",
      err,
    });
  }
};

export const addPolicyDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.files) {
      return res.status(400).json({
        status: false,
        message: "Can't upload empty file",
      });
    }
    const { file } = req.files;
    const { name: orgFile, data } = file as UploadedFile;
    const { documentType } = req.body;

    if (!checkDataLength(data)) {
      return res.status(400).json({
        status: false,
        message: "File is empty",
      });
    }

    if (!documentType) {
      return res.status(400).json({
        status: false,
        message: "Document type is required",
      });
    }

    // get filename extension from orgFile
    const fileName = `${uuidv4()}.${orgFile.split(".").pop()}`;
    const upload: boolean = await uploadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      String(process.env.RMA_ONBOARDING_AZ_BLOB),
      fileName,
      data,
    );

    console.log(upload);

    if (!upload) {
      return res.status(400).json({
        status: false,
        message: "Unable to upload file",
      });
    }

    const createdFile = await PolicyDocuments.create(
      {
        fileName: fileName,
        policyId: id,
        documentType: documentType,
        orgFileName: orgFile,
        createdBy: String(req?.auth?.payload?.user),
      },
      { returning: true },
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: createdFile.dataValues,
    });
  } catch (err: any) {
    console.log("///////////////////////////////////////////////", err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getPolicyDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const member = await PolicyDocuments.findAll({
      where: {
        policyId: id,
      },
      tableHint: TableHints.NOLOCK,
    });

    return res.status(200).json({
      success: true,
      message: "Policy document found",
      data: member,
    });
  } catch (err: any) {
    console.log(
      "Policy document found Policy document found Policy document found Policy document found ",
      err,
    );

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const policyDocumentsDownloadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const blobFileEntry = await PolicyDocuments.findOne({
      attributes: ["id", "fileName", "orgFileName"],
      where: {
        id: id,
      },
      tableHint: TableHints.NOLOCK,
    });

    if (!blobFileEntry) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    const result = await downloadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      String(process.env.RMA_SUPPORTDOCS_AZ_BLOB),
      blobFileEntry.fileName,
    );

    logger.debug(result);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    return res
      .status(200)
      .download(result, `${blobFileEntry.orgFileName}`, (err) => {
        if (err) {
          res.status(404);
        }
        // delete file
        fs.unlink(result, () => {
          console.log("File was deleted"); // Callback
        });
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred unable to download file",
      err,
    });
  }
};
