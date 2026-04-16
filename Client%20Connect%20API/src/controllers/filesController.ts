import fs, { access } from "fs";
import { downloadFileAZ, uploadFileAZ } from "../utils/azure_storage";
import { Request, Response } from "express";
import { checkDataLength } from "../lib/utils/fileUtils";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
const {
  File,
  onboardingPolicy,
  onboarding_file_actions,
} = require("../models");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { logger } from "../middleware/logger";
import { TableHints, where, Op } from "sequelize";
import path from "path";
import { sendEmailWithGraphApi } from "../utils/sendEmail";
import { table } from "console";

const logDir = path.join(__dirname, "logs"); // Folder path
const logFile = path.join(logDir, "app-log.json"); // File path

// uniqueIdGenerator.js

// Simulated in-memory store
let lastGenerated: { date: string | null; count: number } = {
  date: null,
  count: 0,
};

function pad(number: number, length = 3) {
  return number.toString().padStart(length, "0");
}

function getShortDate() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function generateFileId(appName: any) {
  const today = getShortDate();

  // Reset count if date has changed
  if (lastGenerated.date !== today) {
    lastGenerated.date = today;
    lastGenerated.count = 1;
  } else {
    lastGenerated.count += 1;
  }

  const counter = pad(lastGenerated.count);
  return `${appName}${today}${counter}`;
}

export const fileUploadController = async (req: Request, res: Response) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        status: false,
        message: "Can't upload empty file",
      });
    }

    const { file } = req.files;
    const { name: orgFile, data } = file as UploadedFile;
    const {
      providerId,
      joinDate,
      productType,
      productOptionId,
      brokerageId,
      providerInceptionDate,
    } = req.body;

    const uniqueId = generateFileId(
      String(req?.auth?.payload?.rmaAppName || "CC"),
    ); // Unique ID generator function, e.g., "CC-RMA-240901-001"

    // Math.random().toString(36).substring(2, 10).toUpperCase();

    if (!checkDataLength(data)) {
      return res.status(400).json({
        status: false,
        message: "File is empty",
      });
    }

    if (!productType) {
      return res.status(400).json({
        status: false,
        message: "Product type is required",
      });
    }

    if (!providerId) {
      return res.status(400).json({
        status: false,
        message: "Provider Id is required",
      });
    }

    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is missing",
      });
    }

    // if join date is not a valid date
    if (isNaN(Date.parse(joinDate))) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is not a valid date",
      });
    }

    // check if joinDate is the 1st of the current month or in the future

    if (
      new Date(joinDate) <
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is in the past",
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

    if (!upload) {
      return res.status(400).json({
        status: false,
        message: "Unable to upload file",
      });
    }

    // set joinDate to 1st of the month
    const date = new Date(joinDate);
    date.setDate(1);
    const joinDateFormatted = date.toISOString().split("T")[0];
    const joinDateFormatted2 = new Date(joinDateFormatted);

    const createdFile = await File.create(
      {
        uniqueId: uniqueId,
        fileName: fileName,
        productType: productType,
        orgFileName: orgFile,
        joinDate: joinDateFormatted2,
        providerId: providerId,
        createdBy: String(req?.auth?.payload?.user),
        productOptionId: productOptionId || null,
        brokerageId: brokerageId || null,
        providerInceptionDate: providerInceptionDate || null,
      },
      { returning: true },
    );

    // console.log(createdFile);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: createdFile.dataValues,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const fileDownloadController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // console.log(String(req?.auth?.payload?.user));

    const blobFileEntry = await File.findOne({
      attributes: ["id", "fileName", "orgFileName", "status"],
      // where: { createdBy: String(req?.auth?.payload?.user), id: id },
      where: { id: id },
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
      String(process.env.RMA_ONBOARDING_AZ_BLOB),
      blobFileEntry.fileName,
    );

    logger.debug(JSON.stringify(result));

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

export const fileDownloadControllerType = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, type } = req.params;

    // console.log(String(req?.auth?.payload?.user));

    const blobFileEntry = await File.findOne({
      attributes: ["id", "documents"],
      where: { id: id },
      tableHint: TableHints.NOLOCK,
    });

    if (!blobFileEntry) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    // check if documents contains key 'type'
    if (!blobFileEntry.documents[type]) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    const result = await downloadFileAZ(
      String(process.env.RMA_ONBOARDING_AZ_CONNECTION),
      String(process.env.RMA_ONBOARDING_AZ_BLOB),
      blobFileEntry.documents[type],
    );

    logger.debug(JSON.stringify(result));

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Unable to download file",
      });
    }

    return res
      .status(200)
      .download(result, `${type}_${blobFileEntry.orgFileName}`, (err) => {
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

export const getAllFileUploadEntriesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productType } = req.params;
    const { approvals, viewAll, nonRMA } = req.query;

    const rmaAppRoles = Array.isArray(req?.auth?.payload?.rmaAppRoles)
      ? req?.auth?.payload?.rmaAppRoles
      : [];
    const rmaAppUserMetaData: { BrokerageIds?: string[] } =
      req?.auth?.payload?.rmaAppUserMetadata || {};

    let whereCondition: object = {};

    let notAllowParanoid: boolean = true;

    if (approvals) {
      whereCondition = {
        approverId: String(req?.auth?.payload?.user),
      };
    } else if (viewAll) {
      whereCondition = {};

      // if 'CDA-BROKERAGE-Broker Manager' in appUserType then print brokerageIds
      if (
        rmaAppRoles &&
        (rmaAppRoles.includes("CDA-BROKERAGE-Broker Manager") ||
          rmaAppRoles.includes("CDA-BROKERAGE-Broker Representative"))
      ) {
        if (!rmaAppUserMetaData?.BrokerageIds) {
          return res.status(200).json({
            success: false,
            message: "No files found",
          });
        }

        whereCondition = {
          ...whereCondition,
          brokerageId: rmaAppUserMetaData?.BrokerageIds,
        };
      }
    }
    // if CDA-RMA-Policy Admin or CDA-RMA-User Admin
    else if (
      nonRMA &&
      rmaAppRoles &&
      (rmaAppRoles.includes("CDA-RMA-Policy Admin") ||
        rmaAppRoles.includes("CDA-RMA-User Admin"))
    ) {
      // createdby should not have a randmutual.co.za email address
      whereCondition = {
        createdBy: {
          [Op.notLike]: "%randmutual.co.za",
        },
        approverId: String(req?.auth?.payload?.user),
      };
    } else {
      whereCondition = {
        createdBy: String(req?.auth?.payload?.user),
      };
      notAllowParanoid = false;
    }

    if (productType) {
      whereCondition = {
        ...whereCondition,
        productType: productType,
      };
    }

    // console.log(whereCondition);

    const uploadedFiles = await File.findAll({
      where: whereCondition,
      paranoid: notAllowParanoid,
      tableHint: TableHints.NOLOCK,
    });

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No file upload entries found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File uploads found",
      data: uploadedFiles,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getFileByUniqueId = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;

    console.log("THIS uniqueId", uniqueId);

    if (!uniqueId) {
      return res.status(400).json({
        success: false,
        message: "File uniqueId is required",
      });
    }

    let whereCondition: object = {
      uniqueId: uniqueId,
    };

    const uploadedFiles = await File.findOne({
      where: whereCondition,
      paranoid: false,
    });

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No file upload entry found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File uploads found",
      data: uploadedFiles,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getFileController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File id is required",
      });
    }

    let whereCondition: object = {
      // createdBy: String(req?.auth?.payload?.user),
      id: id,
    };

    const uploadedFiles = await File.findOne({
      where: whereCondition,
      paranoid: false,
    });

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No file upload entry found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File uploads found",
      data: uploadedFiles,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description: add a patch to the status of the file based on :id param being passed as well as a status being set in the request body
// @route: PATCH /file/:id
// @access: Private
// @returns: JSON object with success message and updated data

export const updateFileStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status, statusDescription } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File id is required",
      });
    }

    // check if status is provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    let whereCondition: object = {
      createdBy: String(req?.auth?.payload?.user),
      id: id,
    };

    const uploadedFile = await File.findOne({
      where: whereCondition,
    });

    if (!uploadedFile) {
      return res.status(200).json({
        success: false,
        message: "No file upload entry found",
      });
    }

    const updatedFile = await uploadedFile.update(
      {
        status: status,
        statusDescription: statusDescription,
      },
      { returning: true },
    );

    return res.status(200).json({
      success: true,
      message: "File status updated",
      data: updatedFile.dataValues,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description: delete a file based on :id param being passed
// @route: DELETE /file/:id
// @access: Private
// @returns: JSON object with success message
export const deleteFileController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File id is required",
      });
    }

    let whereCondition: object = {
      createdBy: String(req?.auth?.payload?.user),
      id: id,
    };

    const uploadedFile = await File.findOne({
      where: whereCondition,
    });

    if (!uploadedFile) {
      return res.status(200).json({
        success: false,
        message: "No file upload entry found",
      });
    }

    await uploadedFile.destroy();

    // get all policies onboardingPolicy and delete the file from the policy
    // const policies = await onboardingPolicy.findAll({
    //   where: {
    //     fileId: id,
    //   },
    // });

    // if (!policies || policies.length === 0) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "File deleted",
    //   });
    // }

    // raw query to delete the file from the policy
    const query = `UPDATE onboarding.onboardingPolicies SET deletedAt = current_timestamp WHERE fileId = '${id}';`;
    await onboardingPolicy.sequelize.query(query);

    return res.status(200).json({
      success: true,
      message: "File and policies deleted",
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// {
//     "fileId": "845bbe94-03e3-41b9-ac42-65d52d2468fd",
//     "userType": "broker",
//     "assignedUser": "wayne+brokerrep@cdasolutions.co.za",
//     "requestDescription": [
//         {
//             "type": "paragraph",
//             "children": [
//                 {
//                     "text": "Please Fix Error"
//                 }
//             ]
//         }
//     ],
//     "requestedBy": "wayne+rmaadmin@cdasolutions.co.za",
//     "link": "/Onboarding/FileByUniqueId/R2DZUUU9"
// }

export const createFileAction = async (req: Request, res: Response) => {
  try {
    const {
      fileId,
      assignedUser,
      link,
      requestDescription,
      requestedBy,
      userType,
    } = req.body;

    if (!fileId || !assignedUser || !requestedBy) {
      return res.status(400).json({
        success: false,
        message: "File ID, assigned user, and requested by are required",
      });
    }

    // Convert `requestDescription` to HTML
    const formattedBody = requestDescription
      .map((block: any) => {
        const text = block.children.map((child: any) => child.text).join("");
        return `<p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">${text}</p>`;
      })
      .join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50;">File Action Request</h2>
          ${formattedBody}
          ${
            link
              ? `<p><a href="${link}" style="display: inline-block; padding: 10px 16px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">View File</a></p>`
              : ""
          }
          <p style="font-size: 12px; color: #999;">Requested by ${requestedBy}</p>
        </div>
      </div>
    `;

    // send request via email

    await sendEmailWithGraphApi(
      assignedUser,
      "File Action Request",
      emailHtml,
      "HTML",
    );

    let email = {
      to: assignedUser,
      subject: "File Action Request",
      body: emailHtml,
      bodyType: "HTML",
    };

    const newAction = await onboarding_file_actions.create({
      file_id: fileId,
      assignedTo: assignedUser,
      description: formattedBody,
      requestedBy: requestedBy,
      link: link || null,
      email: JSON.stringify(email),
      status: "pending",
      userType: userType,
      completedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "File action created successfully",
      data: newAction,
    });
  } catch (err: any) {
    // Log the detailed, nested error to your server console
    console.error("DETAILED DATABASE ERROR:", JSON.stringify(err, null, 2));

    // You can also log just the original error object
    console.error("ORIGINAL ERROR:", err.original);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getFileActions = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required",
      });
    }

    const actions = await onboarding_file_actions.findAll({
      where: { file_id: fileId },
      order: [["createdAt", "DESC"]],
    });

    if (!actions || actions.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No file actions found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "File actions retrieved successfully",
      data: actions,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// router.route("/fileAction/:id").put(updateFileAction);

export const updateFileAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completedAt } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "File action ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const action = await onboarding_file_actions.findOne({
      where: { id: id },
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        message: "File action not found",
      });
    }

    const updatedAction = await action.update({
      status: status,
      completedAt: completedAt || null,
    });

    return res.status(200).json({
      success: true,
      message: "File action updated successfully",
      data: updatedAction,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};
