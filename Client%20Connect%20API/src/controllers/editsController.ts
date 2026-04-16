import { Request, Response } from "express";
import { checkDataLength } from "../lib/utils/fileUtils";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { downloadFileAZ, uploadFileAZ } from "../utils/azure_storage";
const {
  SupportDocument,
  editRequest,
  editPolicy,
  approver,
  sequelize,
} = require("../models");
const { Op, literal, QueryTypes } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { TableHints, where } from "sequelize";
import { logger } from "../middleware/logger";
import { string } from "yup";
import { SAIDValidator, contactNoValidator } from "../utils/validator";
import { RMABankVerification } from "../utils/rmaBanking";

// standard file includes for editRequest
const standardFieldsPolicyData = [
  "PolicyId",
  "PolicyNumber",
  "brokerage",
  "scheme",
  "mainMember",
  "mainMemberId",
  "BrokerageId",
  "ParentPolicyNumber",
  "PolicyStatus",
  "EffectiveFrom",
  "policyCancelReasonEnum",
  "policyCancelReasonId",
  "ProductOptionId",
  "ProductOptionCode",
  "InstallmentPremium",
  "coverAmount",
  "AdminPercentage",
  "CommissionPercentage",
  "BinderFeePercentage",
  "PolicyMembers",
  "PolicyMembersOrg",
  "updatedAt",
  "updatedBy",
  "BankingDetails",
  "BankingDetailsOrg",
  "PolicyDetailsOrg",
  "paymentMethodId",
  "regularInstallmentDayOfMonth",
  "decemberInstallmentDayOfMonth",
];

const standardFieldsPolicyData2 = [
  "PolicyId",
  "PolicyNumber",
  "brokerage",
  "scheme",
  "mainMember",
  "mainMemberId",
  "BrokerageId",
  "ParentPolicyNumber",
  "PolicyStatus",
  "EffectiveFrom",
  "policyCancelReasonEnum",
  "policyCancelReasonId",
  "ProductOptionId",
  "ProductOptionCode",
  "InstallmentPremium",
  "coverAmount",
  "AdminPercentage",
  "CommissionPercentage",
  "BinderFeePercentage",
  // "PolicyMembers",
  // "PolicyMembersOrg",
  "updatedAt",
  "updatedBy",
  // "BankingDetails",
  // "BankingDetailsOrg",
  // "PolicyDetailsOrg",
  "paymentMethodId",
  "regularInstallmentDayOfMonth",
  "decemberInstallmentDayOfMonth",
];

// @description: Create a new edit request
// @route: POST /edit/requests
// @access: Private
export const createEditRequest = async (req: Request, res: Response) => {
  try {
    const {
      requestDescription,
      requestedBy,
      requestedDate,
      requestType,
      BrokerageId,
      coverAmount,
      ParentPolicyNumber,
      PolicyId,
      PolicyNumber,
      brokerage,
      scheme,
      mainMember,
      mainMemberId,
    } = req.body;

    // check if requestDescription is empty
    if (!requestDescription) {
      return res.status(400).json({
        success: false,
        message: "Request description is required",
      });
    }

    // check if requestedBy is empty
    if (!requestedBy) {
      return res.status(400).json({
        success: false,
        message: "Requested by is required",
      });
    }

    // check if requestedDate is empty
    if (!requestedDate) {
      return res.status(400).json({
        success: false,
        message: "Requested date is required",
      });
    }

    // check if requestType is empty
    if (!requestType) {
      return res.status(400).json({
        success: false,
        message: "Request type is required",
      });
    }

    // check that requestType is array that conaints multiple of the following values
    // 1. Add member
    // 2. Update member
    // 3. Update cover level
    // 4. Update address details
    // 5. Remove member
    // 6. Cancel policy
    if (
      !requestType.includes("Add member") &&
      !requestType.includes("Update member") &&
      !requestType.includes("Update cover level") &&
      !requestType.includes("Update address details") &&
      !requestType.includes("Remove member") &&
      !requestType.includes("Cancel policy")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Request type must contain one or more of the following values: 'Add member', 'Update member', 'Update cover level', 'Update address details', 'Remove member', 'Cancel policy'",
      });
    }

    // console.log("requestType", requestType);

    // editPolicy should contain
    // ParentPolicyNumber,
    //   PolicyId,
    //   PolicyNumber,
    //   brokerage,
    //   scheme,
    //   mainMember,
    //   mainMemberId,
    //  BrokerageId
    // check that editPolicy is not empty

    // check that BrokerageId is not empty
    if (!BrokerageId) {
      return res.status(400).json({
        success: false,
        message: "Brokerage Id is required",
      });
    }

    // check that ParentPolicyNumber is not empty
    if (!ParentPolicyNumber) {
      return res.status(400).json({
        success: false,
        message: "Parent Policy Number is required",
      });
    }

    // check that PolicyId is not empty
    if (!PolicyId) {
      return res.status(400).json({
        success: false,
        message: "Policy Id is required",
      });
    }

    // check that PolicyNumber is not empty
    if (!PolicyNumber) {
      return res.status(400).json({
        success: false,
        message: "Policy Number is required",
      });
    }

    // check that brokerage is not empty
    if (!brokerage) {
      return res.status(400).json({
        success: false,
        message: "Brokerage is required",
      });
    }

    // check that scheme is not empty
    if (!scheme) {
      return res.status(400).json({
        success: false,
        message: "Scheme is required",
      });
    }

    // check that mainMember is not empty
    if (!mainMember) {
      return res.status(400).json({
        success: false,
        message: "Main Member is required",
      });
    }

    // check that mainMemberId is not empty
    if (!mainMemberId) {
      return res.status(400).json({
        success: false,
        message: "Main Member Id is required",
      });
    }

    // if requestType is Cancellation
    if (requestType === "Cancel policy") {
      // check if req.body.EffectiveFrom is empty
      // if (!req.body.EffectiveFrom) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Effective from is required",
      //   });
      // }

      // check if req.body.policyCancelReasonEnum is empty
      if (!req.body.policyCancelReasonEnum) {
        return res.status(400).json({
          success: false,
          message: "Policy cancel reason is required",
        });
      }

      // check if req.body.policyCancelReasonId is empty
      if (!req.body.policyCancelReasonId) {
        return res.status(400).json({
          success: false,
          message: "Policy cancel reason id is required",
        });
      }

      // check if req.body.cancellationDate is empty and is a valid date
      if (!req.body.EffectiveFrom) {
        return res.status(400).json({
          success: false,
          message: "Cancellation date is required",
        });
      }
    }

    // console.log("req.body.EffectiveFrom", req.body.EffectiveFrom);

    let uploadedFiles = [];
    // if attachments is not empty, check that it is an array
    if (req.files) {
      const attachments = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const attachment of attachments) {
        const { name: orgFile, data } = attachment as UploadedFile;

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
            documentType: "Attachment",
            orgFileName: orgFile,
            createdBy: String(req?.auth?.payload?.user),
          },
          { returning: true },
        );

        uploadedFiles.push(createdFile.dataValues);
      }
    }

    // console.log("requestedBy", requestedBy);

    const t = await sequelize.transaction();
    try {
      const edit = await editRequest.create(
        {
          requestDescription: requestDescription,
          requestedBy: requestedBy,
          requestedDate: requestedDate,
          attachments: uploadedFiles,
          requestType: requestType,
          createdBy: String(req?.auth?.payload?.user),
          updatedBy: String(req?.auth?.payload?.user),
          approverId:
            requestType === "Cancel policy"
              ? await getLeastBusyApprover(
                  String(req?.auth?.payload?.user),
                  "canc",
                )
              : null,
          requestStatus: requestType === "Cancel policy" ? "Submitted" : "Edit",
          requestStatusNote:
            requestType === "Cancel policy"
              ? "Request submitted"
              : "Request created",
        },
        {
          transaction: t,
        },
      );

      await editPolicy.create(
        {
          BrokerageId: BrokerageId,
          ParentPolicyNumber: ParentPolicyNumber,
          PolicyId: PolicyId,
          PolicyNumber: PolicyNumber,
          brokerage: brokerage,
          scheme: scheme,
          mainMember: mainMember,
          coverAmount: coverAmount,
          mainMemberId: mainMemberId,
          createdBy: String(req?.auth?.payload?.user),
          updatedBy: String(req?.auth?.payload?.user),
          requestId: edit.id,
          PolicyStatus: requestType === "Cancellation" ? "Cancelled" : null,
          EffectiveFrom: req.body.EffectiveFrom || null,
          policyCancelReasonEnum: req.body.policyCancelReasonEnum || null,
          policyCancelReasonId: req.body.policyCancelReasonId || null,
        },
        {
          transaction: t,
        },
      );

      await t.commit();

      // get the created edit request with the policy
      let createdEdit = await editRequest.findOne({
        where: { id: edit.id },
        include: [
          {
            model: editPolicy,
            as: "PolicyData",
            attributes: standardFieldsPolicyData,
            tableHint: TableHints.NOLOCK,
          },
        ],
        tableHint: TableHints.NOLOCK,
      });

      return res.status(201).json({
        success: true,
        message: "Request created successfully",
        data: createdEdit,
      });
    } catch (err: any) {
      // await t.rollback();
      console.log(err);
      return res.status(400).json(sequelizeErrorHandler(err));
    }
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// @description: Get all edit requests
// @route: GET /edit/requests
// @access: Private
export const getEditRequests = async (req: Request, res: Response) => {
  try {
    // console.log("Current User", String(req?.auth?.payload?.user));

    const { status, createdBy, approverId, active, inactive, policyId } =
      req.query;

    let whereCondition: object = { active: true };

    if (createdBy) {
      whereCondition = {
        ...whereCondition,
        createdBy: String(req?.auth?.payload?.user),
      };
    }

    if (approverId) {
      whereCondition = {
        ...whereCondition,
        approverId: String(req?.auth?.payload?.user),
      };
    }

    if (inactive) {
      whereCondition = {
        ...whereCondition,
        active: false,
      };
    } else if (active) {
      whereCondition = {
        ...whereCondition,
        active: true,
      };
    }

    if (status) {
      whereCondition = {
        ...whereCondition,
        requestStatus: {
          [Op.eq]: status,
        },
      };
    } else if (!approverId && !policyId) {
      whereCondition = {
        ...whereCondition,
        requestStatus: {
          [Op.notIn]: ["Submitted", "Approved", "Complete", "Processing"],
        },
      };
    } else if (approverId && !policyId) {
      whereCondition = {
        ...whereCondition,
        requestStatus: "Submitted",
      };
    }

    // console.log("whereCondition", whereCondition);
    const rmaAppRoles = Array.isArray(req?.auth?.payload?.rmaAppRoles)
      ? req?.auth?.payload?.rmaAppRoles
      : [];
    const rmaAppUserMetaData: { BrokerageIds?: string[] } =
      req?.auth?.payload?.rmaAppUserMetadata || {};

    let brokerWhereCondition: object = {};
    // if 'CDA-BROKERAGE-Broker Manager' in appUserType then print brokerageIds
    if (
      rmaAppRoles &&
      (rmaAppRoles.includes("CDA-BROKERAGE-Broker Manager") ||
        rmaAppRoles.includes("CDA-BROKERAGE-Broker Representative"))
    ) {
      if (!rmaAppUserMetaData?.BrokerageIds) {
        return res.status(200).json({
          success: false,
          message: "No policies found",
        });
      }
      brokerWhereCondition = {
        brokerageId: {
          [Op.in]: rmaAppUserMetaData?.BrokerageIds,
        },
      };
    }

    if (policyId) {
      brokerWhereCondition = {
        ...brokerWhereCondition,
        PolicyId: policyId,
      };
    }

    const edits = await editRequest.findAll({
      include: [
        {
          model: editPolicy,
          as: "PolicyData",
          attributes: standardFieldsPolicyData2,
          tableHint: TableHints.NOLOCK,
          where: brokerWhereCondition,
        },
      ],
      attributes: [
        "id",
        "active",
        "requestType",
        "requestDescription",
        "requestedBy",
        "requestedDate",
        [
          literal(
            `CASE WHEN expiryDate < GETDATE() THEN 'Expired' ELSE requestStatus END`,
          ),
          "requestStatus",
        ],
        "requestStatusNote",
        "expiryDate",
        "createdBy",
        "updatedBy",
        "approverId",
        "approvedAt",
        "createdAt",
        "updatedAt",
        "attachments",
      ],

      where: whereCondition,
      tableHint: TableHints.NOLOCK,
    });

    // if no edits are found
    if (edits.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No requests found",
      });
    }

    // console.log(edits);

    return res.status(200).json({
      success: true,
      data: edits,
    });
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// @description: Get a single edit request
// @route: GET /edit/requests/:id
// @access: Private
export const getEditRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // const edit = await editRequest.findOne({
    //   where: { id: id },
    //   include: [
    //     {
    //       model: editPolicy,
    //       as: "PolicyData",
    //       attributes: standardFieldsPolicyData,
    //       tableHint: TableHints.NOLOCK,
    //     },
    //   ],

    const edit = await editRequest.findOne({
      where: { id: id },
      include: [
        {
          model: editPolicy,
          as: "PolicyData",
          attributes: standardFieldsPolicyData,
          tableHint: TableHints.NOLOCK,
        },
      ],
      attributes: [
        "id",
        "active",
        "requestType",
        "requestDescription",
        "requestedBy",
        "requestedDate",
        [
          literal(
            `CASE WHEN expiryDate < GETDATE() THEN 'Expired' ELSE requestStatus END`,
          ),
          "requestStatus",
        ],
        "requestStatusNote",
        "expiryDate",
        "createdBy",
        "updatedBy",
        "approverId",
        "approvedAt",
        "createdAt",
        "updatedAt",
        "attachments",
      ],
      tableHint: TableHints.NOLOCK,
    });

    if (!edit) {
      return res.status(200).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: edit,
    });
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// @description: Update an edit request
// @route: PUT /edit/requests/:id
// @access: Private
export const updateEditRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      PolicyData,
      requestStatus,
      requestStatusNote,
      requestDescription,
      requestedBy,
      requestedDate,
      requestType,
      BrokerageId,
      ParentPolicyNumber,
      PolicyId,
      PolicyNumber,
      brokerage,
      scheme,
      mainMember,
      mainMemberId,
      approverId,
    } = req.body;

    // check if ID exists on request
    const edit = await editRequest.findOne({
      where: { id: id },
    });

    if (!edit) {
      return res.status(200).json({
        success: false,
        message: "Request not found",
      });
    }

    // check if requestDescription is empty
    if (!requestDescription) {
      return res.status(400).json({
        success: false,
        message: "Request description is required",
      });
    }

    // check if requestedBy is empty
    if (!requestedBy) {
      return res.status(400).json({
        success: false,
        message: "Requested by is required",
      });
    }

    // check if requestedDate is empty
    // if (!requestedDate) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Requested date is required",
    //   });
    // }

    // check if requestType is empty
    if (!requestType) {
      return res.status(400).json({
        success: false,
        message: "Request type is required",
      });
    }

    // check that requestType is array that conaints multiple of the following values
    // 1. Add member
    // 2. Update member
    // 3. Update cover level
    // 4. Update address details
    // 5. Remove member
    // 6. Cancel policy
    if (
      !requestType.includes("Add member") &&
      !requestType.includes("Update member") &&
      !requestType.includes("Update cover level") &&
      !requestType.includes("Update address details") &&
      !requestType.includes("Remove member") &&
      !requestType.includes("Cancel policy")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Request type must contain one or more of the following values: 'Add member', 'Update member', 'Update cover level', 'Update address details', 'Remove member', 'Cancel policy'",
      });
    }

    // if approverId is not set then error for submit request
    if (approverId && !edit.approverId) {
      return res.status(400).json({
        success: false,
        message:
          "No existing approver found for this request, please submuit first",
      });
    }

    // if requestType is "Cancel policy" and requestStatus is "Approved"
    if (
      requestType === "Cancel policy" &&
      ["Approved", "Complete"].includes(requestStatus)
    ) {
      // approve the request
      await editRequest.update(
        {
          requestStatus: requestStatus,
          requestStatusNote: requestStatusNote,
          approvedAt: new Date(),
          updatedBy: String(req?.auth?.payload?.user),
        },
        {
          where: { id: id },
        },
      );
      return res.status(200).json({
        success: true,
        message: "Request approved",
      });
    }

    if (
      requestType === "Cancel policy" &&
      ["Approved", "Rejected"].includes(requestStatus)
    ) {
      // update the request
      await editRequest.update(
        {
          requestStatus: requestStatus,
          requestStatusNote: requestStatusNote,
          approvedAt: requestStatus === "Approved" ? new Date() : null,
          updatedBy: String(req?.auth?.payload?.user),
          requestedBy: requestedBy,
          requestedDescription: requestDescription,
        },
        {
          where: { id: id },
        },
      );

      return res.status(200).json({
        success: true,
        message: "Request approved",
      });
    }

    if (requestType === "Cancel policy" && requestStatus === "Submitted") {
      // update the request
      await editRequest.update(
        {
          requestStatus: requestStatus,
          requestStatusNote: requestStatusNote,
          updatedBy: String(req?.auth?.payload?.user),
          requestedBy: requestedBy,
          requestDescription: requestDescription,
        },
        {
          where: { id: id },
        },
      );

      // if requestStatus is Submitted then also update the policyData
      await editPolicy.update(
        {
          policyCancelReasonEnum: PolicyData?.policyCancelReasonEnum || null,
          policyCancelReasonId: PolicyData?.policyCancelReasonId || null,
        },
        {
          where: { requestId: id },
        },
      );

      return res.status(200).json({
        success: true,
        message: "Request approved",
      });
    }

    // editPolicy should contain
    // ParentPolicyNumber,
    //   PolicyId,
    //   PolicyNumber,
    //   brokerage,
    //   scheme,
    //   mainMember,
    //   mainMemberId,
    //  BrokerageId
    // check that editPolicy is not empty

    // check that BrokerageId is not empty
    if (!BrokerageId) {
      return res.status(400).json({
        success: false,
        message: "Brokerage Id is required",
      });
    }

    // check that ParentPolicyNumber is not empty
    if (!ParentPolicyNumber) {
      return res.status(400).json({
        success: false,
        message: "Parent Policy Number is required",
      });
    }

    // check that PolicyId is not empty
    if (!PolicyId) {
      return res.status(400).json({
        success: false,
        message: "Policy Id is required",
      });
    }

    // check that PolicyNumber is not empty
    if (!PolicyNumber) {
      return res.status(400).json({
        success: false,
        message: "Policy Number is required",
      });
    }

    // check that brokerage is not empty
    if (!brokerage) {
      return res.status(400).json({
        success: false,
        message: "Brokerage is required",
      });
    }

    // check that scheme is not empty
    if (!scheme) {
      return res.status(400).json({
        success: false,
        message: "Scheme is required",
      });
    }

    // check that mainMember is not empty
    if (!mainMember) {
      return res.status(400).json({
        success: false,
        message: "Main Member is required",
      });
    }

    // check that mainMemberId is not empty
    if (!mainMemberId) {
      return res.status(400).json({
        success: false,
        message: "Main Member Id is required",
      });
    }

    // if requestType is Cancel policy
    if (requestType === "Cancel policy") {
      // check if req.body.EffectiveFrom is empty
      if (!req.body.EffectiveFrom) {
        return res.status(400).json({
          success: false,
          message: "Effective from is required",
        });
      }

      // check if req.body.policyCancelReasonEnum is empty
      if (!req.body.policyCancelReasonEnum) {
        return res.status(400).json({
          success: false,
          message: "Policy cancel reason is required",
        });
      }

      // check if req.body.policyCancelReasonId is empty
      if (!req.body.policyCancelReasonId) {
        return res.status(400).json({
          success: false,
          message: "Policy cancel reason id is required",
        });
      }
    }

    let uploadedFiles = [];
    // if attachments is not empty, check that it is an array
    if (req.files) {
      const attachments = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (const attachment of attachments) {
        const { name: orgFile, data } = attachment as UploadedFile;

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
            documentType: "Attachment",
            orgFileName: orgFile,
            createdBy: String(req?.auth?.payload?.user),
          },
          { returning: true },
        );

        uploadedFiles.push(createdFile.dataValues);
      }
    }

    const t = await sequelize.transaction();
    try {
      await editRequest.update(
        {
          requestDescription: requestDescription,
          requestedBy: requestedBy,
          requestedDate: requestedDate,
          attachments: uploadedFiles,
          requestType: requestType,
          createdBy: String(req?.auth?.payload?.user),
          updatedBy: String(req?.auth?.payload?.user),
          approverId: approverId
            ? approverId
            : requestType === "Cancel policy"
            ? await getLeastBusyApprover(
                String(req?.auth?.payload?.user),
                "canc",
              )
            : null,
          requestStatus: requestType === "Cancel policy" ? "Submitted" : "Edit",
          requestStatusNote:
            requestType === "Cancel policy"
              ? "Request submitted"
              : "Request created",
        },
        {
          where: { id: id },
          transaction: t,
        },
      );

      // console.log("policyCancelReasonId", req.body);

      await editPolicy.update(
        {
          BrokerageId: BrokerageId,
          ParentPolicyNumber: ParentPolicyNumber,
          PolicyId: PolicyId,
          PolicyNumber: PolicyNumber,
          brokerage: brokerage,
          scheme: scheme,
          mainMember: mainMember,
          mainMemberId: mainMemberId,
          createdBy: String(req?.auth?.payload?.user),
          updatedBy: String(req?.auth?.payload?.user),
          PolicyStatus: requestType === "Cancellation" ? "Cancelled" : null,
          EffectiveFrom: req.body.EffectiveFrom || null,
          policyCancelReasonEnum: req.body.policyCancelReasonEnum || null,
          policyCancelReasonId: req.body.policyCancelReasonId || null,
        },
        {
          where: { requestId: id },
          transaction: t,
        },
      );

      await t.commit();

      // get the created edit request with the policy
      let createdEdit = await editRequest.findOne({
        where: { id: edit.id },
        include: [
          {
            model: editPolicy,
            as: "PolicyData",
            attributes: standardFieldsPolicyData,
            tableHint: TableHints.NOLOCK,
          },
        ],
        tableHint: TableHints.NOLOCK,
      });

      return res.status(201).json({
        success: true,
        message: "Request created successfully",
        data: createdEdit,
      });
    } catch (err: any) {
      // await t.rollback();
      console.log(err);
      return res.status(400).json(sequelizeErrorHandler(err));
    }
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// @description: delete an edit request
// @route: DELETE /edit/requests/:id
// @access: Private
export const deleteEditRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const edit = await editRequest.findOne({
      where: { id: id },
    });

    if (!edit) {
      return res.status(200).json({
        success: false,
        message: "Request not found",
      });
    }

    await editRequest.update(
      {
        active: false,
        status: "Deleted",
      },
      {
        where: { id: id },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Request deactivated",
    });
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// @description: get list of approvers available for a request, which is all approvers in edit team excluding the request creator
// @route: GET /edit/requests/:id/approvers
// @access: Private
export const getApprovers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const edit = await editRequest.findOne({
      where: { id: id },
    });

    if (!edit) {
      return res.status(200).json({
        success: false,
        message: "Request not found",
      });
    }

    // if approverId is not set then error for submit request
    if (!edit.approverId) {
      return res.status(400).json({
        success: false,
        message:
          "No existing approver found for this request, please submuit first",
      });
    }

    const approvers = await approver.findAll({
      where: {
        team: "edits",
        approverId: {
          [Op.ne]: edit.createdBy,
        },
      },
    });

    if (!approvers || approvers.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No approvers found",
      });
    }

    return res.status(200).json({
      success: true,
      data: approvers,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// @description: Get approver with least pending approvals
// @access: Private
const getLeastBusyApprover = async (
  createdBy: string,
  team: string = "edits",
): Promise<number | null> => {
  try {
    // Get approver with minimum number of active requests
    const result = await sequelize.query(
      `
      WITH ApproverCounts AS (
        SELECT 
          a.approverId,
          COUNT(er.id) as approval_count
        FROM app_data.approvers a (nolock)
        LEFT JOIN edit.requests er (nolock) ON a.approverId = er.approverId and er.requestStatus in ('Submitted')
          AND er.active = 1
        WHERE a.team = '${team}'
        and a.approverId <> '${createdBy}'
        GROUP BY a.approverId
      )
      SELECT TOP 1 approverId 
      FROM ApproverCounts
      ORDER BY approval_count ASC
    `,
      {
        type: QueryTypes.SELECT,
      },
    );

    console.log("ApproverCounts", result);

    if (!result || result.length === 0) {
      return null;
    }

    return result[0].approverId;
  } catch (err) {
    console.error("Error getting least busy approver:", err);
    return null;
  }
};

export const getAllApprovers = async (
  createdBy: string,
): Promise<number | null> => {
  try {
    // Get approver with minimum number of active requests
    const result = await sequelize.query(
      `
      WITH ApproverCounts AS (
        SELECT 
          a.approverId,
          COUNT(er.id) as approval_count
        FROM app_data.approvers a (nolock)
        LEFT JOIN edit.requests er (nolock) ON a.approverId = er.approverId 
          AND er.active = 1
        WHERE a.team = 'edits'
        and a.approverId <> '${createdBy}'
        GROUP BY a.approverId
      )
      SELECT TOP 1 approverId 
      FROM ApproverCounts
      ORDER BY approval_count ASC
    `,
      {
        type: QueryTypes.SELECT,
      },
    );

    console.log("ApproverCounts", result);

    if (!result || result.length === 0) {
      return null;
    }

    return result[0].approverId;
  } catch (err) {
    console.error("Error getting least busy approver:", err);
    return null;
  }
};

// @description: update request status and add approverId
// @route: PUT /edit/requests/:id/submit
// @access: Private
export const submitEditRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const edit = await editRequest.findOne({
      where: { id: id },
    });

    if (!edit) {
      return res.status(200).json({
        success: false,
        message: "Request not found",
      });
    }

    const approverId =
      edit?.approverId ||
      (await getLeastBusyApprover(
        edit.createdBy,
        edit.requestType === "Cancel policy" ? "canc" : "edits",
      ));

    if (!approverId) {
      return res.status(400).json({
        success: false,
        message: "No available approvers found",
      });
    }

    await editRequest.update(
      {
        requestStatus: "Submitted",
        requestStatusNote: "Request submitted",
        approverId: approverId,
      },
      {
        where: { id: id },
      },
    );

    const updatedRequest = await editRequest.findOne({
      where: { id: id },
      include: [
        {
          model: editPolicy,
          as: "PolicyData",
          attributes: standardFieldsPolicyData,
          tableHint: TableHints.NOLOCK,
        },
      ],
      tableHint: TableHints.NOLOCK,
    });

    return res.status(201).json({
      success: true,
      message: "Request submitted",
      data: updatedRequest,
    });
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};

// set type for edits - addresses
// this may still change
type address = {
  AddressTypeId: number;
  AddressLine1: string;
  AddressLine2: string | null;
  City: string | null;
  Province: string | null;
  Country: string | null;
  PostalCode: string | null;
};

// set type for VOPD
type VOPD = {
  idNumber: string;
  dateOfBirth: Date;
  dateOfDeath: Date;
  firstName: string;
  surname: string;
  maritalStatus: string;
};

// set type for edits - PolicyMembers
type PolicyMember = {
  RolePlayerId: number | 0;
  FirstName: string;
  Surname: string;
  IdTypeId: number;
  IdNumber: string;
  DateOfBirth: Date;
  PassportExpiryDate: Date | null; // dont capture this
  Nationality: string | null; // dont capture this
  Gender: string | null; // dont capture this
  MemberTypeId: number;
  BenefitId: number; // dont capture this for now awaiting clarification
  BenefitCode: string | null; // dont capture this for now awaiting clarification
  Premium: number; // dont capture this
  CoverAmount: number;
  PolicyInceptionDate: Date;
  EmploymentStartDate: Date | null; // dont capture this
  IsBeneficiary: boolean | false;
  EmailAddress: string;
  MobileNumber: string;
  SecondaryNumber: string | null;
  PreferredCommunicationType: number;
  MonthlyPreTaxIncome: number | null; // dont capture this
  MemberAction: number | 0; // 0 nothinf, 1 add, 2 update, 3 delete
  InsuredLifeRemovalReason: number | null; // only set if MemberAction is 3
  IsAlive: boolean;
  endDate: Date | null; // dont capture this
  DateOfDeath: Date | null;
  DeathCertificateNumber: string | null; // dont capture this
  IsVopdVerified: boolean;
  DateVopdVerified: Date;
  vopdResponse: VOPD | null;
  addresses: address[] | null;
  status: string;
  exceptions: { field: string; message: string }[];
};

// Add this interface at the top of the file
interface BankingDetailsType {
  rolePlayerId: number;
  effectiveDate: string;
  accountNumber: string;
  bankBranchId: number;
  bankAccountType: number;
  accountHolderName: string;
  accountHolderIdNumber: string;
  branchCode: string;
  rolePlayerBankingId: number;
  hyphenStatus: string;
  hyphenResponse: object;
}

// @description: update policyData for a request
// @route: PUT /edit/requests/:id/policyData
// @access: Private
export const updatePolicyData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const edit = await editRequest.findOne({
      where: { id: id },
      include: [
        {
          model: editPolicy,
          as: "PolicyData",
          attributes: ["PolicyId"],
          tableHint: TableHints.NOLOCK,
        },
      ],
    });

    if (!edit) {
      return res.status(200).json({
        success: false,
        message: "Request not found",
      });
    }

    const {
      PolicyData,
      InstallmentPremium,
      requestStatus,
      requestStatusNote,
      requestType,
      requestedBy,
      coverAmount,
      PolicyMembers,
      PolicyMembersOrg,
    } = req.body;

    let approverId = "";

    if (requestStatus === "Submitted") {
      approverId =
        edit?.approverId ||
        (await getLeastBusyApprover(
          edit.createdBy,
          requestType === "Cancel policy" ? "canc" : "edits",
        ));
    } else {
      approverId = edit?.approverId || null;
    }

    if (requestStatus === "Submitted" && !approverId) {
      return res.status(400).json({
        success: false,
        message: "No available approvers found",
      });
    }

    // check that PolicyId is not empty
    if (!PolicyData?.PolicyId) {
      return res.status(400).json({
        success: false,
        message: "Policy Id is required",
      });
    }

    // check that PolicyId matches the one in the request
    if (PolicyData?.PolicyId !== edit?.PolicyData?.PolicyId) {
      return res.status(400).json({
        success: false,
        message: "Policy Id does not match the one in the request",
      });
    }

    // in case of cancellation and status is approved then just update status
    if (requestType === "Cancel policy" && requestStatus === "Approved") {
      await editRequest.update(
        {
          requestStatus: requestStatus,
          requestStatusNote: requestStatusNote,
          updatedBy: String(req?.auth?.payload?.user),
        },
        {
          where: { id: id },
        },
      );

      return res.status(201).json({
        success: true,
        message: "Request updated successfully",
      });
    }

    // check that ProductOptionId is not empty
    if (!PolicyData?.ProductOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product Option Id is required",
      });
    }

    // check that ProductOptionCode is not empty
    if (!PolicyData?.ProductOptionCode) {
      return res.status(400).json({
        success: false,
        message: "Product Option Code is required",
      });
    }

    // check that InstallmentPremium is not empty
    if (!InstallmentPremium) {
      return res.status(400).json({
        success: false,
        message: "Installment Premium is required",
      });
    }

    // check that coverAmount is not empty
    if (!coverAmount) {
      return res.status(400).json({
        success: false,
        message: "Cover Amount is required",
      });
    }

    // check that AdminPercentage is not empty
    if (
      PolicyData?.AdminPercentage === null ||
      PolicyData?.AdminPercentage === undefined ||
      PolicyData?.AdminPercentage === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin Percentage is required",
      });
    }

    // check that CommissionPercentage is not empty
    if (
      PolicyData?.CommissionPercentage === null ||
      PolicyData?.CommissionPercentage === undefined ||
      PolicyData?.CommissionPercentage === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Commission Percentage is required",
      });
    }

    // check that BinderFeePercentage is not empty
    if (
      PolicyData?.BinderFeePercentage === null ||
      PolicyData?.BinderFeePercentage === undefined ||
      PolicyData?.BinderFeePercentage === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Binder Fee Percentage is required",
      });
    }

    // check that PolicyMembers is not empty
    if (!PolicyMembers) {
      return res.status(400).json({
        success: false,
        message: "Policy Members is required",
      });
    }

    // check that PolicyMembersOrg is not empty
    if (!PolicyMembersOrg) {
      return res.status(400).json({
        success: false,
        message: "Policy Members Org is required",
      });
    }

    // check that PolicyMembers and PolicyMembersOrg are arrays
    if (!Array.isArray(PolicyMembers) || !Array.isArray(PolicyMembersOrg)) {
      return res.status(400).json({
        success: false,
        message: "Policy Members and Policy Members Org must be arrays",
      });
    }

    let PolicyMembersArr = [];

    // check for PolicyMembers
    for (const member of PolicyMembers) {
      let {
        RolePlayerId,
        FirstName,
        Surname,
        IdTypeId,
        IdNumber,
        DateOfBirth,
        MemberTypeId,
        CoverAmount,
        PolicyInceptionDate,
        IsBeneficiary,
        EmailAddress,
        MobileNumber,
        SecondaryNumber,
        PreferredCommunicationType,
        MemberAction,
        IsAlive,
        DateOfDeath,
        IsVopdVerified,
        DateVopdVerified,
        vopdResponse,
        addresses,
        InsuredLifeRemovalReason,
      } = member;

      // add exceptions column to member
      let exceptions: { field: string; message: string }[] = [];

       if (
        PreferredCommunicationType &&
        PreferredCommunicationType !== "" &&
        ![1, 3].includes(Number(PreferredCommunicationType))
      ) {
        exceptions.push({
          field: "PreferredCommunicationType",
          message:
            "Invalid communication method. Only Email and SMS are allowed.",
        });
      }

      // Validate MobileNumber
      if (MobileNumber) {
        const validatedCell = contactNoValidator(MobileNumber);
        if (!validatedCell) {
          exceptions.push({
            field: "MobileNumber",
            message: "Invalid Contact Numbers",
          });
        } else {
          member.MobileNumber = validatedCell;
          MobileNumber = validatedCell;
        }
      }

      if (Number(PreferredCommunicationType) === 1 && !EmailAddress) {
        exceptions.push({
          field: "EmailAddress",
          message: "Email address is required for preferred communication",
        });
      }

      if (Number(PreferredCommunicationType) === 3 && !MobileNumber) {
        exceptions.push({
          field: "MobileNumber",
          message: "Mobile number is required for preferred communication",
        });
      }

      // RolePlayerId needs to be 0 or greater
      if (
        RolePlayerId === undefined ||
        RolePlayerId === null ||
        RolePlayerId < 0
      ) {
        // console.log("RolePlayerId", RolePlayerId);
        exceptions.push({
          field: "RolePlayerId",
          message: "RolePlayerId is required and must be 0 or greater",
        });
      }

      // FirstName is required
      if (!FirstName) {
        exceptions.push({
          field: "FirstName",
          message: "FirstName is required",
        });
      }

      // Surname is required
      if (!Surname) {
        exceptions.push({
          field: "Surname",
          message: "Surname is required",
        });
      }

      // IdTypeId is required
      if (!IdTypeId || ![1, 2].includes(IdTypeId)) {
        exceptions.push({
          field: "IdTypeId",
          message: "Invalid Id Type",
        });
      }

      // IdNumber is required
      if (!IdNumber) {
        exceptions.push({
          field: "IdNumber",
          message: "Id Number is required",
        });
      }

      // DateOfBirth is required
      if (!DateOfBirth) {
        exceptions.push({
          field: "DateOfBirth",
          message: "Date Of Birth is required",
        });
      }

      // MemberTypeId is required
      if (!MemberTypeId || ![1, 2, 3, 4, 5, 6].includes(MemberTypeId)) {
        exceptions.push({
          field: "MemberTypeId",
          message: "Member Type Id is invalid",
        });
      }

      // CoverAmount is required for MemberTypeId 1, 2, 3, 4
      if (
        [1, 2, 3, 4].includes(MemberTypeId) &&
        (!CoverAmount || CoverAmount <= 0)
      ) {
        exceptions.push({
          field: "CoverAmount",
          message: "Cover Amount is required",
        });
      }

      // PolicyInceptionDate is required
      if (!PolicyInceptionDate) {
        exceptions.push({
          field: "PolicyInceptionDate",
          message: "Policy Inception Date is required",
        });
      }

      // MemberAction is required
      if (
        (!MemberAction && MemberAction !== 0) ||
        ![0, 1, 2, 3].includes(MemberAction)
      ) {
        exceptions.push({
          field: "MemberAction",
          message: "Member Action is required",
        });
      }

      if (MemberAction === 3) {
        if (!InsuredLifeRemovalReason) {
          exceptions.push({
            field: "InsuredLifeRemovalReason",
            message: "Insured Life Removal Reason is required",
          });
        }
      }

      const status =
        exceptions.length > 0
          ? "Error"
          : MemberAction === 0
          ? "No Change"
          : MemberAction === 1
          ? "Add"
          : MemberAction === 2
          ? "Update"
          : "Delete";

      PolicyMembersArr.push({ ...member, exceptions, status });
      // try {
      //   const fullMember: PolicyMember = {
      //     RolePlayerId: member.RolePlayerId,
      //     FirstName: member.FirstName,
      //     Surname: member.Surname,
      //     IdTypeId: member.IdTypeId,
      //     IdNumber: member.IdNumber,
      //     DateOfBirth: member.DateOfBirth,
      //     PassportExpiryDate: null,
      //     Nationality: null,
      //     Gender: null,
      //     MemberTypeId: member.MemberTypeId,
      //     BenefitId: 0,
      //     BenefitCode: null,
      //     Premium: 0,
      //     CoverAmount: member.CoverAmount,
      //     PolicyInceptionDate: member.PolicyInceptionDate,
      //     EmploymentStartDate: null,
      //     IsBeneficiary: member.IsBeneficiary,
      //     EmailAddress: member.EmailAddress,
      //     MobileNumber: member.MobileNumber,
      //     SecondaryNumber: member.SecondaryNumber,
      //     PreferredCommunicationType: member.PreferredCommunicationType,
      //     MonthlyPreTaxIncome: null,
      //     MemberAction: member.MemberAction,
      //     IsAlive: member.IsAlive,
      //     endDate: null,
      //     DateOfDeath: member.DateOfDeath,
      //     DeathCertificateNumber: null,
      //     IsVopdVerified: member.IsVopdVerified,
      //     DateVopdVerified: member.DateVopdVerified,
      //     vopdResponse: member.vopdResponse,
      //     addresses: member.addresses,
      //     status: member.status,
      //     exceptions: member.exceptions,
      //   };

      //   PolicyMembers.push(fullMember);
      // } catch (err: any) {
      //   console.log("type", err);
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "An error occurred" });
      // }
    }

    // console.log("PolicyMembersArr", PolicyMembersArr)
    // if (BankingDetails) {
    //   // Validate required fields
    //   const requiredFields: (keyof BankingDetailsType)[] = [
    //     "rolePlayerId",
    //     "effectiveDate",
    //     "accountNumber",
    //     "bankBranchId",
    //     "bankAccountType",
    //     "accountHolderIdNumber",
    //     "branchCode",
    //     "rolePlayerBankingId",
    //     "hyphenStatus",
    //   ];

    //   for (const field of requiredFields) {
    //     if (!BankingDetails[field]) {
    //       return res.status(400).json({
    //         success: false,
    //         message: `${field} is required in Banking Details`,
    //       });
    //     }
    //   }

    //   // Validate data types
    //   if (
    //     typeof BankingDetails.rolePlayerId !== "number" ||
    //     typeof BankingDetails.bankBranchId !== "number" ||
    //     typeof BankingDetails.bankAccountType !== "number" ||
    //     typeof BankingDetails.rolePlayerBankingId !== "number"
    //   ) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid data types in Banking Details",
    //     });
    //   }

    //   // Validate ID number format (assuming South African ID)
    //   if (SAIDValidator(BankingDetails.idNumber)) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid Account Holder ID Number format",
    //     });
    //   }

    //   // if hyphenStatus is 'Verified' then need the hyphenResponse
    //   if (BankingDetails.hyphenStatus === "Verified") {
    //     if (!BankingDetails.hyphenResponse) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Hyphen Response is required",
    //       });
    //     }
    //   }

    //   // if hyphenStatus is 'Not Verified' then run the hyphen verification
    //   if (BankingDetails.hyphenStatus === "Not Verified") {
    //     // Validate account number (basic check)
    //     const hyphen_verification: any = await RMABankVerification(
    //       BankingDetails.accountNumber,
    //       BankingDetails.branchCode,
    //       BankingDetails.bankAccountType,
    //       BankingDetails.accountHolderIdNumber,
    //     );

    //     console.log(hyphen_verification);

    //     if (!hyphen_verification.result) {
    //       return res
    //         .status(400)
    //         .json({ success: false, message: hyphen_verification.message });
    //     }
    //   }

    //   // Validate effective date
    //   if (!Date.parse(BankingDetails.effectiveDate)) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid Effective Date format",
    //     });
    //   }

    //   // effective date should be more than 5 days from today
    //   if (
    //     new Date(BankingDetails.effectiveDate) <
    //     new Date(new Date().setDate(new Date().getDate() + 10))
    //   ) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Effective Date should be more than 10 days from today",
    //     });
    //   }

    //   // effective date can't be more than 6 weeks from today
    //   if (
    //     new Date(BankingDetails.effectiveDate) >
    //     new Date(new Date().setDate(new Date().getDate() + 42))
    //   ) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Effective Date can't be more than 6 weeks from today",
    //     });
    //   }
    // }

    const t = await sequelize.transaction();
    try {
      await edit.update(
        {
          requestStatus: requestStatus,
          requestStatusNote: requestStatusNote,
          requestType: requestType,
          requestedBy: requestedBy,

          approverId: approverId || null,

          updatedBy: String(req?.auth?.payload?.user),
        },
        {
          where: { id: id },
          transaction: t,
        },
      );

      // update editPolicy
      await editPolicy.update(
        {
          ...PolicyData,
          PolicyMembers: PolicyMembersArr,
          PolicyMembersOrg,
          updatedBy: String(req?.auth?.payload?.user),
        },
        {
          where: { requestId: id, PolicyId: PolicyData?.PolicyId },
          transaction: t,
        },
      );

      await t.commit();
    } catch (err: any) {
      t.rollback();
      console.log("getError", err);
      return res.status(400).json(sequelizeErrorHandler(err));
    }

    const editRes = await editRequest.findOne({
      where: { id: id },
      include: [
        {
          model: editPolicy,
          as: "PolicyData",
          attributes: standardFieldsPolicyData,
          tableHint: TableHints.NOLOCK,
        },
      ],
      tableHint: TableHints.NOLOCK,
    });

    // console.log(editRes);

    return res.status(200).json({
      success: true,
      message: "Policy Data updated successfully",
      data: editRes,
    });
  } catch (err: any) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "An error occurred" });
  }
};
