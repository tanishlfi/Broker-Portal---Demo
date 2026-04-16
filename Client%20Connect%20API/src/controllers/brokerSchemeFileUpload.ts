import fs from "fs";
import { uploadFileAZ, downloadFileAZ } from "../utils/azure_storage";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { checkDataLength } from "../lib/utils/fileUtils";
const { SchemeDocument } = require("../models");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { logger } from "../middleware/logger";

export const brokerSchemeFileUpload = async (req: Request, res: Response) => {
  try {
    const { scheme_id } = req.params;

    if (!req.files) {
      return res.status(400).json({
        status: false,
        message: "Can't upload empty file",
      });
    }

    const { file } = req.files;

    const { name: orgFile, data } = file as UploadedFile;
    const { DocumentType } = req.body;

    console.log("file Upload", file);

    const FileName = `${uuidv4()}.${orgFile.split(".").pop()}`;
    const upload: boolean = await uploadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      "schemes",
      FileName,
      data,
    );

    if (!upload) {
      return res.status(400).json({
        status: false,
        message: "Error uploading file",
      });
    }

    const createdFile = await SchemeDocument.create(
      {
        scheme_id,
        FileName: FileName,
        DocumentType,
        OriginalFileName: orgFile,
        CreatedBy: String(req?.auth?.payload?.user),
      },
      {
        returning: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: createdFile.dataValues,
    });
  } catch (error: any) {
    console.error("Error uploading files: ", error);
    return res.status(400).json(sequelizeErrorHandler(error));
  }
};

export const downloadBrokerSchemeUpload = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const blobFileEntry = await SchemeDocument.findOne({
      where: {
        id: id,
      },
      attributes: ["id", "scheme_id", "FileName", "OriginalFileName"],
    });

    if (!blobFileEntry) {
      return res.status(400).json({
        status: false,
        message: "File not found",
      });
    }

    const result = await downloadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      "schemes",
      blobFileEntry.FileName,
    );

    logger.debug("The azure result: ", result);

    if (!result) {
      return res.status(400).json({
        status: false,
        message: "Unable to download file",
      });
    }

    return res
      .status(200)
      .download(result, `${blobFileEntry.OriginalFileName}`, (err) => {
        if (err) {
          res.status(400);
        }
        fs.unlink(result, () => {
          console.log("File was deleted");
        });
      });
  } catch (error: any) {
    console.error("Error downloading files: ", error);
    return res.status(400).json(sequelizeErrorHandler(error));
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blobFileEntry = await SchemeDocument.findOne({
      where: {
        id: id,
      },
    });

    if (!blobFileEntry) {
      return res.status(400).json({
        status: false,
        message: "File not found",
      });
    }

    blobFileEntry.destroy();

    return res.status(200).json({
      status: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting files: ", error);
    return res.status(400).json(sequelizeErrorHandler(error));
  }
};

export const getAllBrokerSchemeUploads = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, DocumentType } = req.params;

    const blobFileEntry = await SchemeDocument.findAll({
      where: {
        scheme_id: id,
        DocumentType,
      },
    });

    if (!blobFileEntry) {
      return res.status(400).json({
        status: false,
        message: "File not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Files found",
      data: blobFileEntry,
    });
  } catch (error: any) {
    console.error("Error downloading files: ", error);
    return res.status(400).json({
      status: false,
      message: "Error fetching files",
      error: error,
    });
  }
};
