// deprecate later
import { Request, Response } from "express";
import {
  SAIDValidator,
  contactNoValidator,
  emailValidator,
} from "../utils/validator";
const {
  Policy,
  PolicyMember,
  Member,
  File,
  ProductType,
  BrokerageRepresentativeMap,
  policyNote,
  sequelize,
  Sequelize,
  PolicyCheck,
  onboardingData,
  onboardingPolicy,
} = require("../models");
const { Op } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { addIDVOPD } from "./vopd";

import { getAgeByPolicyJoinDate } from "../utils/dates";
import { RolePlayerTypeEnums } from "../enums/rolePlayerTypeEnums";
import { logger } from "../middleware/logger";
import { sendEmailWithGraphApi } from "../utils/sendEmail";
import { CreateNotification } from "../utils/CreateNotification";

// return the description of the member type
const returnMemberType = (memberTypeId: number) => {
  switch (memberTypeId) {
    case 1:
      return "Main Member";
    case 2:
      return "Spouse";
    case 3:
      return "Child";
    case 4:
      return "Extended Family";
    case 5:
      return "Stillborn";
    case 6:
      return "Beneficiary";
    default:
      return "Not Applicable";
  }
};

// return the member type id based on the description
const returnMemberTypeId = (memberType: string) => {
  switch (memberType) {
    case "Main Member":
      return 1;
    case "Spouse":
      return 2;
    case "Child":
      return 3;
    case "Extended Family":
      return 4;
    case "Stillborn":
      return 5;
    case "Beneficiary":
      return 6;
    default:
      return 7;
  }
};

// return the roleplayer type id based on the member type id
const returnRoleplayerType = (memberTypeId: number) => {
  switch (memberTypeId) {
    case 1:
      return 10;
    case 2:
      return 11;
    case 3:
    case 5:
      return 32;
    case 4:
      return 38;
    case 6:
      return 41;
    default:
      return 0;
  }
};

export const getAllPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await Policy.findAll({
      include: [
        {
          model: PolicyMember,
          as: "PolicyMembers",
          required: true,
          include: [
            {
              model: Member,
              as: "Member",
              required: true,
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      message: "Policies retrieved successfully",
      data: policies || [],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting policies",
      error,
    });
  }
};

// @description Get all policies loaded for scheme or rep
export const getAllPoliciesSchemeOrRep = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      productTypeId,
      providerId,
      memberTypeId,
      createdBy,
      limit,
      page,
      status,
      idNumber,
      // fileName,
      fileId,
      brokerageId,
      allocatedApprover,
    } = req.query;

    let actionType: string = "NA";
    // check if word onboarding in req.baseUrl
    if (req.baseUrl.includes("onboarding")) {
      actionType = "ADD";
    } else {
      actionType = "UPDATE";
    }

    let whereCondition: object = { actionType: actionType };

    if (productTypeId) {
      whereCondition = {
        ...whereCondition,
        productTypeId: productTypeId,
      };
    }

    if (providerId) {
      whereCondition = {
        ...whereCondition,
        providerId: providerId,
      };
    }

    if (status) {
      whereCondition = {
        ...whereCondition,
        status: status,
      };
    }

    if (createdBy) {
      whereCondition = {
        ...whereCondition,
        createdBy: String(req?.auth?.payload?.user),
        // [Op.or]: [
        //   { createdBy: String(req?.auth?.payload?.user) },
        //   { updatedBy: String(req?.auth?.payload?.user) },
        // ],
      };
    }

    if (allocatedApprover) {
      whereCondition = {
        ...whereCondition,
        approverId: String(req?.auth?.payload?.user),
      };
    }
    // if (memberTypeId) {
    // whereCondition = {
    //   ...whereCondition,
    //   "$PolicyMembers.memberTypeId$": 1,
    // };
    // }

    let memberWhereCondition: object = {};
    if (idNumber) {
      memberWhereCondition = {
        idNumber: {
          [Op.like]: `%${idNumber}%`,
        },
      };
    }
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

    let fileWhereCondition: object = {};
    let fileWhereRequired: boolean = false;
    // if (fileName) {
    //   fileWhereRequired = true;
    //   fileWhereCondition = {
    //     orgFileName: {
    //       [Op.like]: `%${fileName}%`,
    //     },
    //   };
    // }

    if (fileId) {
      fileWhereRequired = true;
      fileWhereCondition = {
        id: fileId,
      };
    }

    if (brokerageId) {
      brokerWhereCondition = {
        brokerageId: brokerageId,
      };
    }

    let lmt: number = 10;
    if (limit) {
      lmt = parseInt(limit.toString());
    }

    let pg: number = 1;
    if (page) {
      pg = parseInt(page.toString());
    }

    let offset: number = 0;
    if (pg && lmt) {
      offset = (pg - 1) * lmt;
    }

    // const rows = await Policy.findAll({
    //   include: [
    //     {
    //       model: Member,
    //       as: "members",
    //       attributes: ["firstName", "surname", "idNumber"],
    //       required: true,
    //       where: memberWhereCondition,
    //     },
    //     {
    //       model: File,
    //       attributes: ["orgFileName", "id"],
    //       required: false,
    //       where: fileWhereCondition,
    //     },
    //     {
    //       model: policyNote,
    //       as: "notes",
    //       required: false,
    //     },
    //     {
    //       model: BrokerageRepresentativeMap,
    //       required: true,
    //       attributes: ["brokerageId", "representativeId"],
    //     },
    //   ],
    //   where: whereCondition,
    //   order: [["id", "DESC"]],
    //   limt: 2,
    // });

    const { count, rows } = await Policy.findAndCountAll({
      attributes: [
        "createdAt",
        "joinDate",
        "status",
        "statusNote",
        "providerId",
        "id",
        "createdAt",
        "approverId",
        "providerName",
        "brokerageName",
        "createdBy",
      ],
      include: [
        {
          model: Member.unscoped(),
          as: "members",
          attributes: [
            "firstName",
            "surname",
            "idNumber",
            // "members.memberType",
          ],
          through: {
            attributes: ["memberType", "memberTypeId", "exceptions"],
            // where: {
            //   memberTypeId: 1,
            // },
          },
          required: true,
          where: memberWhereCondition,
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: fileWhereRequired,
          where: fileWhereCondition,
        },
        // {
        //   model: policyNote,
        //   as: "notes",
        //   required: false,
        // },
        {
          model: BrokerageRepresentativeMap,
          required: true,
          attributes: ["brokerageId", "representativeId"],
          where: brokerWhereCondition,
        },
      ],
      where: whereCondition,
      order: [["id", "DESC"]],
      // offset: offset,
      // limit: lmt,
      distinct: true,
    });

    if (count === 0) {
      return res.status(200).json({
        success: false,
        message: "No policies found",
      });
    }

    // if rows is empty return no policies found
    // if (!rows) {
    //   return res.status(200).json({
    //     success: false,
    //     message: "No policies found",
    //   });
    // }

    // console.log(JSON.stringify(rows[0]["dataValues"]["members"]));

    // move brokerageId and representativeId to root level and remove BrokerageRepresentativeMap
    const policies = rows.map((policy: any) => {
      let exceptionCount: Number = 0;

      // count number of exceptions
      policy.dataValues.members.forEach((member: any) => {
        if (member.PolicyMember.exceptions) {
          exceptionCount += member.PolicyMember.exceptions.length;
        }
      });

      // replace members with only main member
      policy.dataValues.members = policy.dataValues.members.filter(
        (member: any) => member.PolicyMember.memberTypeId === 1,
      );

      return {
        exceptionCount: exceptionCount,
        brokerageId: policy.dataValues.BrokerageRepresentativeMap.brokerageId,
        representativeId:
          policy.dataValues.BrokerageRepresentativeMap.representativeId,
        ...policy.dataValues,

        BrokerageRepresentativeMap: undefined,
      };
    });

    // const totalPages = Math.ceil(count / lmt);
    // const currentPage = pg;
    // const nextPage = totalPages === currentPage ? null : currentPage + 1;
    // const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;

    return res.status(200).json({
      success: true,
      message: "Policies found",
      count: count,
      // totalPages: totalPages,
      // currentPage: currentPage,
      // nextPage: nextPage,
      // prevPage: prevPage,
      // limit: lmt,
      // status: status || "Any",
      data: policies,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Get a specific policy loaded for scheme or rep
export const getPolicy = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Error, policy id is missing",
      });
    }
    let whereCondition: object = { id: policyId };

    const rmaAppRoles = Array.isArray(req?.auth?.payload?.rmaAppRoles)
      ? req?.auth?.payload?.rmaAppRoles
      : [];
    const rmaAppUserMetaData: { BrokerageIds?: string[] } =
      req?.auth?.payload?.rmaAppUserMetadata || {};

    if (!rmaAppRoles) {
      return res.status(200).json({
        success: false,
        message: "No policies found",
      });
    }

    let brokerWhereCondition: object = {};
    // if 'CDA-BROKERAGE-Broker Manager' in appUserType then print brokerageIds
    if (
      rmaAppRoles.includes("CDA-BROKERAGE-Broker Manager") ||
      rmaAppRoles.includes("CDA-BROKERAGE-Broker Representative")
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

    if (rmaAppRoles.includes("CDA-BROKERAGE-Broker Representative")) {
      whereCondition = {
        ...whereCondition,
        createdBy: String(req?.auth?.payload?.user),
        // [Op.or]: [
        //   { createdBy: String(req?.auth?.payload?.user) },
        //   { updatedBy: String(req?.auth?.payload?.user) },
        // ],
      };
    }

    const policies = await Policy.findOne({
      include: [
        {
          model: Member,
          as: "members",
          required: true,
          // paranoid: false,
          // include: [
          //   {
          //     model: PolicyMember,
          //     as: "PolicyMember",
          //     required: true,
          //   },
          // ],
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: false,
        },
        {
          model: policyNote,
          as: "notes",
          required: false,
        },
        {
          model: BrokerageRepresentativeMap,
          required: true,
          attributes: ["brokerageId", "representativeId"],
          where: brokerWhereCondition,
        },
        {
          model: PolicyCheck,
          as: "checks",
          required: false,
          attributes: ["id", "checkDescr", "status", "updatedAt"],
        },
      ],
      where: whereCondition,
      paranoid: false,
    });

    if (!policies) {
      return res.status(200).json({
        success: false,
        message: "No policy found",
      });
    }

    // move brokerageId and representativeId to root level and remove BrokerageRepresentativeMap
    const policiesReturn = {
      brokerageId: policies.dataValues.BrokerageRepresentativeMap.brokerageId,
      representativeId:
        policies.dataValues.BrokerageRepresentativeMap.representativeId,
      ...policies.dataValues,

      BrokerageRepresentativeMap: undefined,
    };
    return res
      .status(200)
      .json({ success: true, message: "Policy found", data: policiesReturn });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Get a specific policy by policy number
export const getPolicyByPolicyNumber = async (req: Request, res: Response) => {
  try {
    const { policyNumber } = req.params;
    if (!policyNumber) {
      return res.status(400).json({
        success: false,
        message: "Error, policy number is missing",
      });
    }
    const policies = await Policy.findOne({
      include: [
        {
          model: Member,
          as: "members",
          required: true,
          // include: [
          //   {
          //     model: PolicyMember,
          //     as: "PolicyMember",
          //     required: true,
          //   },
          // ],
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: false,
        },
        {
          model: policyNote,
          as: "notes",
          required: false,
        },
        {
          model: BrokerageRepresentativeMap,
          required: true,
          attributes: ["brokerageId", "representativeId"],
        },
      ],
      where: {
        policyNumber: policyNumber,
        // [Op.or]: [
        //   { createdBy: String(req?.auth?.payload?.user) },
        //   { updatedBy: String(req?.auth?.payload?.user) },
        // ],
      },
    });

    if (!policies) {
      return res.status(200).json({
        success: false,
        message: "No policy found",
      });
    }

    // move brokerageId and representativeId to root level and remove BrokerageRepresentativeMap
    const policiesReturn = {
      brokerageId: policies.dataValues.BrokerageRepresentativeMap.brokerageId,
      representativeId:
        policies.dataValues.BrokerageRepresentativeMap.representativeId,
      ...policies.dataValues,

      BrokerageRepresentativeMap: undefined,
    };
    return res
      .status(200)
      .json({ success: true, message: "Policy found", data: policiesReturn });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Get a specific policy by policyId
export const getPolicyByPolicyId = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Error, policyId is missing",
      });
    }
    const policies = await Policy.findOne({
      include: [
        {
          model: Member,
          as: "members",
          required: true,
          // include: [
          //   {
          //     model: PolicyMember,
          //     as: "PolicyMember",
          //     required: true,
          //   },
          // ],
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: false,
        },
        {
          model: policyNote,
          as: "notes",
          required: false,
        },
        {
          model: BrokerageRepresentativeMap,
          required: true,
          attributes: ["brokerageId", "representativeId"],
        },
      ],
      where: {
        policyId: policyId,
        // [Op.or]: [
        //   { createdBy: String(req?.auth?.payload?.user) },
        //   { updatedBy: String(req?.auth?.payload?.user) },
        // ],
      },
    });

    if (!policies) {
      return res.status(200).json({
        success: true,
        message: "No policy found",
        policies: policies,
      });
    }

    // move brokerageId and representativeId to root level and remove BrokerageRepresentativeMap
    const policiesReturn = {
      brokerageId: policies.dataValues.BrokerageRepresentativeMap.brokerageId,
      representativeId:
        policies.dataValues.BrokerageRepresentativeMap.representativeId,
      ...policies.dataValues,

      BrokerageRepresentativeMap: undefined,
    };
    return res
      .status(200)
      .json({ success: true, message: "Policy found", data: policiesReturn });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Create new policy
export const createPolicy = async (req: Request, res: Response) => {
  try {
    const {
      id,
      joinDate,
      members,
      productType,
      providerId,
      coverAmount,
      selectedCategory,
      productOptionId,
      brokerageId,
      representativeId,
      SchemeRolePlayerId,
      providerInceptionDate,
      policyId,
      policyNumber,
      status,
      statusNote,
    } = req.body;

    // if productOptionId is missing
    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Error, product option id is missing",
      });
    }

    // if joinDate is  missing
    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is missing",
      });
    }

    // if cover amount is missing
    if (!coverAmount) {
      return res.status(400).json({
        success: false,
        message: "Error, cover amount is missing",
      });
    }

    // if cover amount is not a number
    if (isNaN(coverAmount)) {
      return res.status(400).json({
        success: false,
        message: "Error, cover amount is not a valid number",
      });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, members is missing",
      });
    }

    // confirm that MemberTypeId = 1 or memberType = Main Member exists in array of members
    let mainMemberVOPDDone: boolean = false;
    const memberTypeId = members.find(
      (member: any) =>
        member.PolicyMember.memberTypeId === 1 ||
        member.PolicyMember.memberType === "Main Member",
    );
    if (!memberTypeId) {
      return res.status(400).json({
        success: false,
        message: "Error, no main member provided",
      });
    } else {
      // member.isVopdVerified = true then set mainMemberVOPDDone to true
      console.log(`Member Type ID: ${JSON.stringify(memberTypeId)}`);
      if (memberTypeId.isVopdVerified) {
        mainMemberVOPDDone = true;
      }
    }

    // check if product type exists
    // const findProduct = await ProductType.findByPk(productTypeId);

    // if (!findProduct) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Product type not found",
    //   });
    // }

    // make sure brokerageId exists
    if (!brokerageId) {
      return res.status(400).json({
        success: false,
        message: "Brokerage id is missing",
      });
    }

    // make sure representativeId exists
    if (!representativeId) {
      return res.status(400).json({
        success: false,
        message: "Representative id is missing",
      });
    }

    // if status , it can only be Submitted, Approved or Declined
    if (status) {
      if (
        ![
          "Draft",
          "Processing",
          "Ready",
          "Error",
          "Submitted",
          "Approved",
          "Rejected",
          "Complete",
          "Issue",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      // if status is  Declined, statusNote is required
      if (status === "Rejected" && !statusNote) {
        return res.status(400).json({
          success: false,
          message: "Status note is required",
        });
      }
    }

    // VALIDATION START

    // set roleplayerTypeId and do a count of main members, spouse, children, extended family, unknown
    let mainMemberCount = 0;
    let spouseCount = 0;
    let childrenCount = 0;
    let extendedFamilyCount = 0;
    let unknownCount = 0;
    let beneficiaryCount = 0;

    let mainMemberAllocation: any = null;
    let spouseAllocation: any = null;
    let memberErrors: boolean = false;
    let memberAge: number = 0;
    let idNumberList: any = [];

    let actionType: string = "NA";
    // check if word onboarding in req.baseUrl
    if (req.baseUrl.includes("onboarding")) {
      actionType = "ADD";
    } else {
      actionType = "UPDATE";
    }

    logger.debug(`Action Type: ${actionType}`);

    const validateMembers = await members.map((member: any) => {
      if (
        member.preferredCommunicationTypeId &&
        member.preferredCommunicationTypeId !== "" &&
        !["1", "3"].includes(String(member.preferredCommunicationTypeId))
      ) {
        member.PolicyMember["exceptions"].push({
          message: `Invalid communication method. Only Email and SMS are allowed.`,
          field: "preferredCommunicationTypeId",
        });
        memberErrors = true;
      }
      member.PolicyMember["roleplayerTypeId"] = returnRoleplayerType(
        member.PolicyMember.memberTypeId,
      );

      member.PolicyMember["memberType"] = returnMemberType(
        member.PolicyMember.memberTypeId,
      );

      // if exception array does not exist, create it
      // if (!member.PolicyMember["exceptions"]) {
      //   member.PolicyMember["exceptions"] = [];
      // }
      // reset exceptions array
      member.PolicyMember["exceptions"] = [];
      // if member.PolicyMember.deletedAt is set, set status to deleted, else set status to new
      member.PolicyMember["status"] = member.PolicyMember.status || "New";
      if (member.PolicyMember.deletedAt) {
        member.PolicyMember["status"] = "Deleted";
      }
      // member.PolicyMember["status"] =
      //   actionType === "ADD" ? "New" : member.PolicyMember.status;

      // check if firstName is provided
      if (!member.firstName) {
        member.PolicyMember["exceptions"].push({
          message: `No first name provided`,
          field: "firstName",
        });
        memberErrors = true;
      }
      // check if firstName is empty
      else if (member.firstName.trim() === "") {
        member.PolicyMember["exceptions"].push({
          message: `First name is empty`,
          field: "firstName",
        });
        memberErrors = true;
      }

      // check if surname is provided
      if (!member.surname) {
        member.PolicyMember["exceptions"].push({
          message: `No surname provided`,
          field: "surname",
        });
        memberErrors = true;
      }
      // check if surname is empty
      else if (member.surname.trim() === "") {
        member.PolicyMember["exceptions"].push({
          message: `No surname provided`,
          field: "surname",
        });
        memberErrors = true;
      }

      // check if ID number is provided
      if (!member.idNumber) {
        member.PolicyMember["exceptions"].push({
          message: `No ID number provided`,
          field: "idNumber",
        });
        memberErrors = true;
      }

      // check if ID number is valid
      if (member.idTypeId === 1 && !SAIDValidator(member.idNumber)) {
        member.PolicyMember["exceptions"].push({
          message: `Invalid ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      }

      // check if ID number is unique
      if (
        idNumberList.includes(member.idNumber) &&
        member.PolicyMember.memberTypeId !== 6
      ) {
        member.PolicyMember["exceptions"].push({
          message: `Duplicate ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      } else {
        idNumberList.push(member.idNumber);
      }

      if (member.cellNumber) {
        const validatedCell = contactNoValidator(member.cellNumber);
        if (!validatedCell) {
          member.PolicyMember["exceptions"].push({
            message: `Invalid Contact Numbers`,
            field: "cellNumber",
          });
          memberErrors = true;
        } else {
          member.cellNumber = validatedCell;
        }
      }

      // FR-01: check preferredCommunicationTypeId === 1 and emailAddress is null then exceptions
      if (member.preferredCommunicationTypeId === "1" && !member.emailAddress) {
        member.PolicyMember["exceptions"].push({
          message: `Email address is required for preferred communication`,
          field: "emailAddress",
        });
        memberErrors = true;
      }

      // FR-01: check preferredCommunicationTypeId === 3 and cellNumber is null then exceptions
      if (member.preferredCommunicationTypeId === "3" && !member.cellNumber) {
        member.PolicyMember["exceptions"].push({
          message: `Cell phone number is required for preferred communication`,
          field: "cellNumber",
        });
        memberErrors = true;
      }

      // check that if PreviousInsurer or PreviousInsurerPolicyNumber or PreviousInsurerJoinDate or PreviousInsurerCancellationDate is set, all must be set
      if (
        (member.PolicyMember.PreviousInsurer ||
          member.PolicyMember.PreviousInsurerPolicyNumber ||
          member.PolicyMember.PreviousInsurerJoinDate ||
          member.PolicyMember.PreviousInsurerCancellationDate) &&
        (!member.PolicyMember.PreviousInsurer ||
          !member.PolicyMember.PreviousInsurerPolicyNumber ||
          !member.PolicyMember.PreviousInsurerJoinDate ||
          !member.PolicyMember.PreviousInsurerCancellationDate)
      ) {
        member.PolicyMember["exceptions"].push({
          message: `Previous insurer details incomplete`,
          field: null,
        });
        memberErrors = true;
      }

      // check that member.PolicyMember.previousInsurerJoinDate is not after previousInsurerCancelDate if values are set
      if (
        member.PolicyMember.PreviousInsurerJoinDate &&
        member.PolicyMember.PreviousInsurerCancellationDate &&
        new Date(member.PolicyMember.PreviousInsurerJoinDate) >=
          new Date(member.PolicyMember.PreviousInsurerCancellationDate)
      ) {
        member.PolicyMember["exceptions"].push({
          message: `Previous insurer join date cannot be on or after cancel date`,
          field: "member.PolicyMember.PreviousInsurerJoinDate",
        });
        memberErrors = true;
      }

      // if previous insurer join date is set, check that previous insurer join date is not after join date
      if (
        member.PolicyMember.PreviousInsurerJoinDate &&
        new Date(member.PolicyMember.PreviousInsurerJoinDate) >=
          new Date(joinDate)
      ) {
        member.PolicyMember["exceptions"].push({
          message: `Previous insurer join date cannot be on or after join date`,
          field: "member.PolicyMember.PreviousInsurerJoinDate",
        });
        memberErrors = true;
      }

      // if previous insurer cancel date is set, check that previous insurer cancel date is not after join date
      if (
        member.PolicyMember.PreviousInsurerCancellationDate &&
        new Date(member.PolicyMember.PreviousInsurerCancellationDate) >=
          new Date(joinDate)
      ) {
        member.PolicyMember["exceptions"].push({
          message: `Previous insurer cancel date cannot be on or after join date`,
          field: "member.PolicyMember.PreviousInsurerCancellationDate",
        });
        memberErrors = true;
      }

      // check that VOPD has run
      // if (member.idTypeId === 1 && member.isVopdVerified === false) {
      //   member.PolicyMember["exceptions"].push({
      //     message: `VOPD has not run`,
      //     field: null,
      //   });
      //   memberErrors = true;
      // }

      // check that member dob is valid
      if (isNaN(Date.parse(member.dateOfBirth))) {
        member.PolicyMember["exceptions"].push({
          message: `Invalid date of birth`,
          field: "dateOfBirth",
        });
      }

      // get member age
      memberAge = -1;
      memberAge = getAgeByPolicyJoinDate(member.dateOfBirth, joinDate);
      member.age = memberAge === -1 ? null : memberAge;
      // check that member age is valid
      if (memberAge === -1) {
        member.PolicyMember["exceptions"].push({
          message: `Invalid age`,
          field: "dateOfBirth",
        });
        memberErrors = true;
      }

      // main member
      if (
        member.PolicyMember.roleplayerTypeId ===
        RolePlayerTypeEnums.MAIN_MEMBER_SELF
      ) {
        mainMemberCount++;
        if (mainMemberCount === 1) {
          mainMemberAllocation = member;
        } else if (mainMemberCount > 1) {
          member.PolicyMember["exceptions"].push({
            message: `Too many main members`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // spouse
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.SPOUSE
      ) {
        spouseCount++;
        if (spouseCount === 1) {
          spouseAllocation = member;
        } else if (spouseCount > 1) {
          member.PolicyMember["exceptions"].push({
            message: `Too many spouses`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // children
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.CHILD
      ) {
        childrenCount++;
        if (childrenCount > 6) {
          member.PolicyMember["exceptions"].push({
            message: `Too many children`,
            field: null,
          });
          memberErrors = true;
        }

        if (
          (member.isDisabled || member.isStudent) &&
          member.supportDocument === null
        ) {
          member.PolicyMember["exceptions"].push({
            message: `No support document`,
            field: "supportDocument",
          });
          memberErrors = true;
        }

        // check if child is over 21 years old and not a student or disable
        if (memberAge > 21 && !member.isDisabled && !member.isStudent) {
          member.PolicyMember["exceptions"].push({
            message: `Child is over 21 years old and not a student or disabled`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // extended family
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.EXTENDED
      ) {
        extendedFamilyCount++;
      } else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.BENEFICIARY
      ) {
        beneficiaryCount++;
      } else {
        unknownCount++;
        // append to member.PolicyMember.exceptions array for unknown roleplayerTypeId found
        member.PolicyMember["exceptions"].push({
          message: `Unknown roleplayer type`,
          field: null,
        });
        memberErrors = true;
      }

      // check main member
      if (
        member.PolicyMember.roleplayerTypeId ===
        RolePlayerTypeEnums.MAIN_MEMBER_SELF
      ) {
        // format tellNumber if specified
        member.tellNumber = member.tellNumber
          ? contactNoValidator(member.tellNumber)
          : null;
        // format cellNumber if specified
        member.cellNumber = member.cellNumber
          ? contactNoValidator(member.cellNumber)
          : null;

        // check if member has valid email if specified
        if (member.emailAddress && !emailValidator(member.emailAddress)) {
          member.PolicyMember["exceptions"].push({
            message: `Invalid email`,
            field: "email",
          });
          memberErrors = true;
        }

        // check if member has at least 1 contact method = tellNumber, cellNumber, email
        if (!member.tellNumber && !member.cellNumber && !member.emailAddress) {
          member.PolicyMember["exceptions"].push({
            message: `No contact method specified`,
            field: null,
          });
          memberErrors = true;
        }

        // check if member has preferredCommunicationTypeId specified
        if (!member.preferredCommunicationTypeId) {
          member.PolicyMember["exceptions"].push({
            message: `No preferred communication type specified`,
            field: null,
          });
          memberErrors = true;
        }

        // check address details
        if (!member.addressLine1) {
          member.PolicyMember["exceptions"].push({
            message: `No address line 1 specified`,
            field: "addressLine1",
          });
          memberErrors = true;
        }

        // postal code needed
        if (!member.postalCode) {
          member.PolicyMember["exceptions"].push({
            message: `No postal code specified`,
            field: "postalCode",
          });
          memberErrors = true;
        }

        // province needed
        if (!member.province) {
          member.PolicyMember["exceptions"].push({
            message: `No province specified`,
            field: "province",
          });
          memberErrors = true;
        }

        // province needs to be in list of provinces full names in capital leeters in South Africa
        const provinces = [
          "EASTERN CAPE",
          "FREE STATE",
          "GAUTENG",
          "KWAZULU-NATAL",
          "LIMPOPO",
          "MPUMALANGA",
          "NORTH WEST",
          "NORTHERN CAPE",
          "WESTERN CAPE",
        ];
        if (member.province && !provinces.includes(member.province)) {
          member.PolicyMember["exceptions"].push({
            message: `Invalid province specified`,
            field: "province",
          });
          memberErrors = true;
        }
      }

      // if addressLine1 longer than 50 characters
      if (member.addressLine1 && member.addressLine1.length > 50) {
        member.PolicyMember["exceptions"].push({
          message: `Address line 1 too long`,
          field: "addressLine1",
        });
        memberErrors = true;
      }

      // if addressLine2 longer than 50 characters
      if (member.addressLine2 && member.addressLine2.length > 50) {
        member.PolicyMember["exceptions"].push({
          message: `Address line 2 too long`,
          field: "addressLine2",
        });
        memberErrors = true;
      }

      // if city longer than 50 characters
      if (member.city && member.city.length > 50) {
        member.PolicyMember["exceptions"].push({
          message: `City too long`,
          field: "city",
        });
        memberErrors = true;
      }

      // if member.PolicyMember.exceptions is not empty set status to error
      if (member.PolicyMember.exceptions.length > 0) {
        member.PolicyMember["status"] = "Error";
      }

      return member;
    });

    // if more than 1 main member, return error
    if (mainMemberCount === 0 || mainMemberCount > 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid number of main members`,
      });
    }

    // if more than 1 spouse, return error
    if (spouseCount > 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid number of spouses`,
      });
    }

    // if unknownCount > 0
    if (unknownCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid number of unknown roleplayer types`,
      });
    }

    let policyStatus: String = "Processing";
    // if memberErrors, set status to Error
    if (memberErrors) {
      policyStatus = "Error";
    } else if (status) {
      policyStatus = status;
    }

    // if memberErrors, return error message with req.body.members replaced by updatedMembers
    // let reqBody = req.body;
    // if (memberErrors) {
    //   // let reqBody = req.body and replace members with updatedMembers
    //   reqBody.members = validateMembers;
    //   reqBody.status = "Error";
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid member details`,
    //     data: reqBody,
    //   });
    // }

    // VALIDATION END

    let brokerageMap = await BrokerageRepresentativeMap.findOne({
      where: {
        brokerageId: brokerageId,
        representativeId: representativeId,
      },
    });

    // console.log(`Brokerage Map: ${JSON.stringify(brokerageMap)}`);

    if (productType !== "Scheme") {
      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "Provider id is missing",
        });
      }

      // BrokerageRepresentativeMapId = providerId;
    } else {
      if (!SchemeRolePlayerId) {
        return res.status(400).json({
          success: false,
          message: "Scheme role player id is missing",
        });
      }

      if (!providerInceptionDate) {
        return res.status(400).json({
          success: false,
          message: "Provider inception date is missing",
        });
      }

      // check joinDate is not before inception date
      if (new Date(joinDate) < new Date(providerInceptionDate)) {
        return res.status(400).json({
          success: false,
          message: "Join date cannot be before inception date",
        });
      }
    }

    if (actionType === "UPDATE" && !policyId) {
      return res.status(400).json({
        success: false,
        message: "Policy id is missing",
      });
    }

    if (actionType === "UPDATE" && !policyNumber) {
      return res.status(400).json({
        success: false,
        message: "Policy number is missing",
      });
    }

    if (id) {
      const findPolicy = await Policy.findByPk(id);

      if (!findPolicy) {
        return res.status(400).json({
          success: false,
          message: "Policy not found",
        });
      }
    }
    // check if policy already is being edited
    else if (actionType === "UPDATE") {
      const editPolicy = await Policy.findOne({
        where: {
          policyId: policyId,
          actionType: "UPDATE",
          status: {
            [Op.notIn]: ["Completed"],
          },
        },
      });

      // if policy found then need to run as update
      if (editPolicy) {
        return res.status(400).json({
          success: false,
          message: "Policy already being edited",
        });
      }
    }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let createPolicy_id: number = 0;
    let PolicyCreated: any = {};
    let createMember: any = {};
    try {
      // if no brokerage map exists, create one
      if (!brokerageMap) {
        brokerageMap = await BrokerageRepresentativeMap.create(
          {
            brokerageId: brokerageId,
            representativeId: representativeId,
          },
          {
            validate: true,
            transaction: t,
          },
        );
      }

      if (!id) {
        logger.debug("Policy Create");
        PolicyCreated = await Policy.create(
          {
            productType: productType,
            BrokerageRepresentativeMapId:
              brokerageMap.dataValues.BrokerageRepresentativeMapId,
            SchemeRolePlayerId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : SchemeRolePlayerId,
            providerId: providerId,
            parentPolicyId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : providerId,
            joinDate: joinDate,
            coverAmount: coverAmount,
            productOptionId: productOptionId,
            brokerageId: brokerageId,
            selectedCategory: selectedCategory,
            createdBy: String(req?.auth?.payload?.user),
            updatedBy: String(req?.auth?.payload?.user),
            providerInceptionDate: providerInceptionDate,
            actionType: actionType,
            policyId: actionType === "ADD" ? null : policyId,
            policyNumber: actionType === "ADD" ? null : policyNumber,
            adminPercentage: req.body.adminPercentage,
            commissionPercentage: req.body.commissionPercentage,
            binderFeePercentage: req.body.binderFeePercentage,
            regularInstallmentDayOfMonth: req.body.regularInstallmentDayOfMonth,
            paymentFrequencyId: req.body.paymentFrequencyId,
            PaymentMethodId: req.body.PaymentMethodId,
            premium: req.body.premium,
            status: policyStatus,
            statusNote: statusNote,
            providerName: req.body.providerName,
            brokerageName: req.body.brokerageName,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        // add policy checks

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "VOPD",
            status: mainMemberVOPDDone,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Too Much Cover",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Too Much Cover RMA",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Claim for RMA",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Benefit Allocation",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Duplicate cover",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );
      } else {
        const policyUpdated = await Policy.update(
          {
            productType: productType,
            status: policyStatus,
            BrokerageRepresentativeMapId:
              brokerageMap.dataValues.BrokerageRepresentativeMapId,
            SchemeRolePlayerId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : SchemeRolePlayerId,
            providerId: providerId,
            parentPolicyId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : providerId,
            joinDate: joinDate,
            coverAmount: coverAmount,
            productOptionId: productOptionId,
            brokerageId: brokerageId,
            selectedCategory: selectedCategory,
            // createdBy: String(req?.auth?.payload?.user),
            updatedBy: String(req?.auth?.payload?.user),
            providerInceptionDate: providerInceptionDate,
            policyId: actionType === "ADD" ? null : policyId,
            policyNumber: actionType === "ADD" ? null : policyNumber,
            adminPercentage: req.body.adminPercentage,
            commissionPercentage: req.body.commissionPercentage,
            binderFeePercentage: req.body.binderFeePercentage,
            regularInstallmentDayOfMonth: req.body.regularInstallmentDayOfMonth,
            paymentFrequencyId: req.body.paymentFrequencyId,
            PaymentMethodId: req.body.PaymentMethodId,
            premium: req.body.premium,
            statusNote: statusNote,
            providerName: req.body.providerName,
            brokerageName: req.body.brokerageName,
          },
          {
            where: {
              id: id,
            },
            transaction: t,
            validate: true,
            returning: true,
            individualHooks: true,
          },
        );
        logger.debug(`Policy Updated: ${JSON.stringify(PolicyCreated)}`);
        PolicyCreated = policyUpdated[1][0].dataValues;
        PolicyCreated["id"] = PolicyCreated.PolicyDataId
          ? PolicyCreated.PolicyDataId
          : PolicyCreated.id;

        update = true;
      }

      let roleplayerTypeId: number = 0;
      // add createdBy and updatedBy to members
      const membersWithCreatedBy = update
        ? await members.map((member: any) => {
            console.log(`Members: ${JSON.stringify(member)}`);
            member.PolicyMember.memberType = returnMemberType(
              member.PolicyMember.memberTypeId,
            );

            member.PolicyMember.roleplayerTypeId = returnRoleplayerType(
              member.PolicyMember.memberTypeId,
            );

            // if not VOPD verified and ID type is SAID, add to VOPD process
            if (
              member.PolicyMember.memberTypeId === 1 &&
              member.idTypeId === 1 &&
              !member.isVopdVerified &&
              SAIDValidator(member.idNumber)
            ) {
              addIDVOPD(member.idNumber);
            }

            // check if policyId is set
            if (!member.PolicyMember.policyId) {
              member.PolicyMember.policyId = PolicyCreated.id;
              member.PolicyMember.CoverAmount = coverAmount;
              member.PolicyMember.startDate = joinDate;
              member.PolicyMember.createdBy = String(req?.auth?.payload?.user);
              member.PolicyMember.updatedBy = String(req?.auth?.payload?.user);
            }

            // TODO Address validation

            // TODO cell number validation
            // console.log(`Members: ${JSON.stringify(member)}`);
            return member;
          })
        : await members.map((member: any) => {
            // check member.PolicyMember.memberTypeId exists
            if (
              !member.PolicyMember.memberTypeId &&
              member.PolicyMember.memberType
            ) {
              member.PolicyMember.memberTypeId = returnMemberTypeId(
                member.PolicyMember.memberType,
              );
            }
            if (
              member.PolicyMember.memberTypeId &&
              !member.PolicyMember.memberType
            ) {
              member.PolicyMember.memberType = returnMemberType(
                member.PolicyMember.memberTypeId,
              );
            }
            if (member.PolicyMember.memberTypeId) {
              roleplayerTypeId = returnRoleplayerType(
                member.PolicyMember.memberTypeId,
              );
            }

            // if not VOPD verified and ID type is SAID, add to VOPD process
            if (
              member.PolicyMember.memberTypeId === 1 &&
              member.idTypeId === 1 &&
              !member.isVopdVerified &&
              SAIDValidator(member.idNumber)
            ) {
              addIDVOPD(member.idNumber);
            }

            // TODO Address validation

            // TODO cell number validation

            member.PolicyMember = {
              ...member.PolicyMember,
              roleplayerTypeId: roleplayerTypeId,
              policyId: PolicyCreated.id,
              CoverAmount: coverAmount,
              startDate: joinDate,
              createdBy: String(req?.auth?.payload?.user),
              updatedBy: String(req?.auth?.payload?.user),
            };
            console.log(`Members: ${JSON.stringify(member)}`);
            return {
              ...member,
              createdBy: String(req?.auth?.payload?.user),
              updatedBy: String(req?.auth?.payload?.user),
            };
          });

      // order members by member type id
      membersWithCreatedBy.sort((a: any, b: any) =>
        a.PolicyMember.memberTypeId > b.PolicyMember.memberTypeId ? 1 : -1,
      );

      // check if id exists in membersWithCreatedBy
      let mainMemberId: number = 0;
      // let createPolicyMember: any = {};
      // console.log(membersWithCreatedBy);
      const promises = await membersWithCreatedBy.map(async (member: any) => {
        // run different query if id exists

        if (member.id) {
          await Member.update(member, {
            where: {
              id: member.id,
            },
            transaction: t,
            validate: true,
            individualHooks: true,
          });
          await PolicyMember.update(member.PolicyMember, {
            where: {
              PolicyMemberId: member.id,
              policyId: PolicyCreated.id,
            },
            transaction: t,
            validate: true,
            individualHooks: true,
          });
        } else {
          createMember = await Member.create(member, {
            transaction: t,
            validate: true,
            returning: true,
          });
          if (member.PolicyMember.memberTypeId === 1) {
            mainMemberId = createMember.dataValues.id;
          }
          // member.PolicyMember["PolicyHolderMemberId"] = mainMemberId;
          createMember = await PolicyMember.create(
            { ...member.PolicyMember, memberId: createMember.dataValues.id },
            {
              transaction: t,
              validate: true,
            },
          );
        }
      });

      // for unhandlerejection error, don't know why yet
      await Promise.all(promises).then(async () => {
        await t.commit();
      });

      createPolicy_id = PolicyCreated.id;
    } catch (err: any) {
      console.log(`hitting this ${err}`);
      await t.rollback();
      return res.status(400).json(sequelizeErrorHandler(err));
    }
    // console.log(brokerageMap);
    const policy = await Policy.findOne({
      where: {
        id: createPolicy_id,
      },
      include: [
        {
          model: Member,
          as: "members",
          required: true,
        },
        {
          model: policyNote,
          as: "notes",
          required: false,
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: false,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: update ? "Policy Updated" : "Policy created",
      data: {
        brokerageId: brokerageMap.dataValues.brokerageId,
        representativeId: brokerageMap.dataValues.representativeId,
        ...policy.dataValues,
      },
    });
  } catch (err: any) {
    console.log(`hitting this ${err}`);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Create new policy limited validations
export const createPolicyNoValidation = async (req: Request, res: Response) => {
  try {
    const {
      id,
      joinDate,
      members,
      productType,
      providerId,
      coverAmount,
      selectedCategory,
      productOptionId,
      brokerageId,
      representativeId,
      SchemeRolePlayerId,
      providerInceptionDate,
      policyId,
      policyNumber,
      status,
      statusNote,
      policyStatusId,
      cancellationReasonId,
    } = req.body;

    // if productOptionId is missing
    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Error, product option id is missing",
      });
    }

    // if joinDate is  missing
    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is missing",
      });
    }

    // if cover amount is missing
    if (!coverAmount) {
      return res.status(400).json({
        success: false,
        message: "Error, cover amount is missing",
      });
    }

    // if cover amount is not a number
    if (isNaN(coverAmount)) {
      return res.status(400).json({
        success: false,
        message: "Error, cover amount is not a valid number",
      });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, members are missing",
      });
    }

    // confirm that MemberTypeId = 1 or memberType = Main Member exists in array of members
    let mainMemberVOPDDone: boolean = false;
    const memberTypeId = members.find(
      (member: any) =>
        member.PolicyMember.memberTypeId === 1 ||
        member.PolicyMember.memberType === "Main Member",
    );
    if (!memberTypeId) {
      return res.status(400).json({
        success: false,
        message: "Error, no main member provided",
      });
    } else {
      // member.isVopdVerified = true then set mainMemberVOPDDone to true
      console.log(`Member Type ID: ${JSON.stringify(memberTypeId)}`);
      if (memberTypeId.isVopdVerified) {
        mainMemberVOPDDone = true;
      }
    }

    // check if product type exists
    // const findProduct = await ProductType.findByPk(productType);

    // if (!findProduct) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Product type not found",
    //   });
    // }

    // make sure brokerageId exists
    if (!brokerageId) {
      return res.status(400).json({
        success: false,
        message: "Brokerage id is missing",
      });
    }

    // make sure representativeId exists
    if (!representativeId) {
      return res.status(400).json({
        success: false,
        message: "Representative id is missing",
      });
    }

    let brokerageMap = await BrokerageRepresentativeMap.findOne({
      where: {
        brokerageId: brokerageId,
        representativeId: representativeId,
      },
    });

    console.log(`Brokerage Map: ${JSON.stringify(brokerageMap)}`);

    if (productType !== "Scheme") {
      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "Provider id is missing",
        });
      }

      // BrokerageRepresentativeMapId = providerId;
    } else {
      if (!SchemeRolePlayerId) {
        return res.status(400).json({
          success: false,
          message: "Scheme role player id is missing",
        });
      }

      if (!providerInceptionDate) {
        return res.status(400).json({
          success: false,
          message: "Provider inception date is missing",
        });
      }

      // check joinDate is not before inception date
      if (new Date(joinDate) < new Date(providerInceptionDate)) {
        return res.status(400).json({
          success: false,
          message: "Join date cannot be before inception date",
        });
      }
    }

    let actionType: string = "NA";
    // check if word onboarding in req.baseUrl
    if (req.baseUrl.includes("onboarding")) {
      actionType = "ADD";
    } else {
      actionType = "UPDATE";
    }

    if (actionType === "UPDATE" && !policyId) {
      return res.status(400).json({
        success: false,
        message: "Policy id is missing",
      });
    }

    if (actionType === "UPDATE" && !policyNumber) {
      return res.status(400).json({
        success: false,
        message: "Policy number is missing",
      });
    }

    if (id) {
      const findPolicy = await Policy.findByPk(id);

      if (!findPolicy) {
        return res.status(400).json({
          success: false,
          message: "Policy not found",
        });
      }
    }
    // check if policy already is being edited
    else if (actionType === "UPDATE") {
      const editPolicy = await Policy.findOne({
        where: {
          policyId: policyId,
          actionType: "UPDATE",
          status: {
            [Op.notIn]: ["Completed"],
          },
        },
      });

      // if policy found then need to run as update
      if (editPolicy) {
        return res.status(400).json({
          success: false,
          message: "Policy already being edited",
        });
      }
    }

    // if status is missing
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Error, status is missing",
      });
    }

    // if status note is missing
    // if (!statusNote) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Error, status note is missing",
    //   });
    // }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let createPolicy_id: number = 0;
    let PolicyCreated: any = {};
    let createMember: any = {};
    try {
      // if no brokerage map exists, create one
      if (!brokerageMap) {
        brokerageMap = await BrokerageRepresentativeMap.create(
          {
            brokerageId: brokerageId,
            representativeId: representativeId,
          },
          {
            validate: true,
            transaction: t,
          },
        );
      }

      if (!id) {
        PolicyCreated = await Policy.create(
          {
            productType: productType,
            BrokerageRepresentativeMapId:
              brokerageMap.dataValues.BrokerageRepresentativeMapId,
            SchemeRolePlayerId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : SchemeRolePlayerId,
            providerId: providerId,
            parentPolicyId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : providerId,
            joinDate: joinDate,
            coverAmount: coverAmount,
            productOptionId: productOptionId,
            brokerageId: brokerageId,
            selectedCategory: selectedCategory,
            createdBy: String(req?.auth?.payload?.user),
            updatedBy: String(req?.auth?.payload?.user),
            providerInceptionDate: providerInceptionDate,
            actionType: actionType,
            policyId: actionType === "ADD" ? null : policyId,
            policyNumber: actionType === "ADD" ? null : policyNumber,
            adminPercentage: req.body.adminPercentage,
            commissionPercentage: req.body.commissionPercentage,
            binderFeePercentage: req.body.binderFeePercentage,
            regularInstallmentDayOfMonth: req.body.regularInstallmentDayOfMonth,
            paymentFrequencyId: req.body.paymentFrequencyId,
            PaymentMethodId: req.body.PaymentMethodId,
            premium: req.body.premium,
            status: status,
            statusNote: statusNote,
            providerName: req.body.providerName,
            brokerageName: req.body.brokerageName,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        // add policy checks
        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "VOPD",
            status: mainMemberVOPDDone,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Too Much Cover",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Too Much Cover RMA",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Claim for RMA",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Benefit Allocation",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        await PolicyCheck.create(
          {
            policyId: PolicyCreated.id,
            checkDescr: "Duplicate cover",
            status: false,
          },
          {
            transaction: t,
            validate: true,
          },
        );
      } else {
        const [instance, created] = await Policy.upsert(
          {
            id: id,
            productType: productType,
            BrokerageRepresentativeMapId:
              brokerageMap.dataValues.BrokerageRepresentativeMapId,
            SchemeRolePlayerId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : SchemeRolePlayerId,
            providerId: providerId,
            parentPolicyId:
              SchemeRolePlayerId === 0 || !SchemeRolePlayerId
                ? null
                : providerId,
            joinDate: joinDate,
            coverAmount: coverAmount,
            productOptionId: productOptionId,
            brokerageId: brokerageId,
            selectedCategory: selectedCategory,
            // createdBy: String(req?.auth?.payload?.user),
            updatedBy: String(req?.auth?.payload?.user),
            providerInceptionDate: providerInceptionDate,
            policyId: actionType === "ADD" ? null : policyId,
            policyNumber: actionType === "ADD" ? null : policyNumber,
            adminPercentage: req.body.adminPercentage,
            commissionPercentage: req.body.commissionPercentage,
            binderFeePercentage: req.body.binderFeePercentage,
            regularInstallmentDayOfMonth: req.body.regularInstallmentDayOfMonth,
            paymentFrequencyId: req.body.paymentFrequencyId,
            PaymentMethodId: req.body.PaymentMethodId,
            premium: req.body.premium,
            status: status,
            statusNote: statusNote,
            providerName: req.body.providerName,
            brokerageName: req.body.brokerageName,
            policyStatusId: policyStatusId,
            cancellationReasonId: cancellationReasonId,
          },
          {
            transaction: t,
            validate: true,
          },
        );

        // console.log(instance.dataValues);

        PolicyCreated = instance ? instance.dataValues : created;

        console.log(
          `Policy: ${JSON.stringify(PolicyCreated)}; Created: ${created}`,
        );

        update = true;
      }

      let roleplayerTypeId: number = 0;
      // add createdBy and updatedBy to members
      const membersWithCreatedBy = update
        ? await members.map((member: any) => {
            member.PolicyMember.memberType = returnMemberType(
              member.PolicyMember.memberTypeId,
            );

            member.PolicyMember.roleplayerTypeId = returnRoleplayerType(
              member.PolicyMember.memberTypeId,
            );

            // if not VOPD verified and ID type is SAID, add to VOPD process
            if (
              member.PolicyMember.memberTypeId === 1 &&
              member.idTypeId === 1 &&
              !member.isVopdVerified &&
              SAIDValidator(member.idNumber)
            ) {
              addIDVOPD(member.idNumber);
            }

            if (!member.PolicyMember.policyId) {
              member.PolicyMember = {
                ...member.PolicyMember,
                policyId: id,
                CoverAmount: coverAmount,
                startDate: joinDate,
                createdBy: String(req?.auth?.payload?.user),
                updatedBy: String(req?.auth?.payload?.user),
              };
            }

            console.log(`Members: ${JSON.stringify(member)}`);

            // TODO Address validation

            // TODO cell number validation
            // console.log(`Members: ${JSON.stringify(member)}`);
            return member;
          })
        : await members.map((member: any) => {
            // check member.PolicyMember.memberTypeId exists
            if (
              !member.PolicyMember.memberTypeId &&
              member.PolicyMember.memberType
            ) {
              member.PolicyMember.memberTypeId = returnMemberTypeId(
                member.PolicyMember.memberType,
              );
            }
            if (
              member.PolicyMember.memberTypeId &&
              !member.PolicyMember.memberType
            ) {
              member.PolicyMember.memberType = returnMemberType(
                member.PolicyMember.memberTypeId,
              );
            }
            if (member.PolicyMember.memberTypeId) {
              roleplayerTypeId = returnRoleplayerType(
                member.PolicyMember.memberTypeId,
              );
            }

            // if not VOPD verified and ID type is SAID, add to VOPD process
            if (
              member.PolicyMember.memberTypeId === 1 &&
              member.idTypeId === 1 &&
              !member.isVopdVerified &&
              SAIDValidator(member.idNumber)
            ) {
              addIDVOPD(member.idNumber);
            }

            // TODO Address validation

            // TODO cell number validation

            member.PolicyMember = {
              ...member.PolicyMember,
              roleplayerTypeId: roleplayerTypeId,
              policyId: PolicyCreated.id,
              CoverAmount: coverAmount,
              startDate: joinDate,
              createdBy: String(req?.auth?.payload?.user),
              updatedBy: String(req?.auth?.payload?.user),
            };
            // console.log(`Members: ${JSON.stringify(member)}`);
            return {
              ...member,
              createdBy: String(req?.auth?.payload?.user),
              updatedBy: String(req?.auth?.payload?.user),
            };
          });

      // order members by member type id
      membersWithCreatedBy.sort((a: any, b: any) =>
        a.PolicyMember.memberTypeId > b.PolicyMember.memberTypeId ? 1 : -1,
      );

      // check if id exists in membersWithCreatedBy
      let mainMemberId: number = 0;
      // let createPolicyMember: any = {};
      // console.log(membersWithCreatedBy);
      const promises = await membersWithCreatedBy.map(async (member: any) => {
        // run different query if id exists
        if (member.id) {
          await Member.upsert(member, {
            transaction: t,
            validate: true,
          });
          await PolicyMember.upsert(member.PolicyMember, {
            transaction: t,
            validate: true,
          });
        } else {
          createMember = await Member.create(member, {
            transaction: t,
            validate: true,
            returning: true,
          });
          if (member.PolicyMember.memberTypeId === 1) {
            mainMemberId = createMember.dataValues.id;
          }
          // member.PolicyMember["PolicyHolderMemberId"] = mainMemberId;
          createMember = await PolicyMember.create(
            { ...member.PolicyMember, memberId: createMember.dataValues.id },
            {
              transaction: t,
              validate: true,
            },
          );
        }
      });

      // for unhandlerejection error, don't know why yet
      await Promise.all(promises).then(async () => {
        await t.commit();
      });

      createPolicy_id = PolicyCreated.id;
    } catch (err: any) {
      console.log(`hitting this ${err}`);
      await t.rollback();
      return res.status(400).json(sequelizeErrorHandler(err));
    }
    // console.log(brokerageMap);
    const policy = await Policy.findOne({
      where: {
        id: createPolicy_id,
      },
      include: [
        {
          model: Member,
          as: "members",
          required: true,
        },
        {
          model: policyNote,
          as: "notes",
          required: false,
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: false,
        },
      ],
    });

    // if policy status = Rejected, send email to createdBy using sendEmailWithGraphApi
    if (policy.status === "Rejected") {
      await sendEmailWithGraphApi(
        policy.createdBy,
        "Policy Rejected",
        `Policy has been rejected by ${policy.approverId}.<br>Reason: ${policy.statusNote}<br>To view the policy: ${process.env.APP_BASE_URL}/Onboarding/Policies/${policy.id}.`,
        "HTML",
      );

      await CreateNotification({
        from_user_email: policy.approverId,
        to_user_email: policy.createdBy,
        variant: "app",
        title: "Policy Rejected",
        message: `Policy has been rejected by ${policy.approverId}.<br>Reason: ${policy.statusNote}`,
        type: "error",
        read: false,
        link: `${process.env.APP_BASE_URL}/Onboarding/Policies/${policy.id}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: update ? "Policy Updated" : "Policy created",
      data: {
        brokerageId: brokerageMap.dataValues.brokerageId,
        representativeId: brokerageMap.dataValues.representativeId,
        ...policy.dataValues,
      },
    });
  } catch (err: any) {
    console.log(`hitting this ${err}`);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Add policy member
export const addPolicyMember = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Error, policy id is missing",
      });
    }

    const member = req.body;

    member.PolicyMember = {
      ...member.PolicyMember,
      policyId: policyId,
      createdBy: String(req?.auth?.payload?.user),
      updatedBy: String(req?.auth?.payload?.user),
    };

    const createMember = await Member.create(member, {
      include: [PolicyMember],
      transaction: t,
      validate: true,
    });

    await t.commit();
    //
    return res.status(201).json({
      success: true,
      message: "Policy member created",
      data: createMember,
    });
  } catch (err: any) {
    console.log(err);
    await t.rollback();
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Update policy
export const updatePolicy = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Error,  policy id is missing",
      });
    }
    const { joinDate, coverAmount, approverId, status } = req.body;

    // if no update value is specified
    if (!coverAmount && !joinDate && !approverId) {
      return res.status(400).json({
        success: false,
        message: "Error, no update value specified",
      });
    }

    let updateValues: object = {};
    if (coverAmount) {
      updateValues = { coverAmount: coverAmount };
    }

    if (joinDate) {
      updateValues = { ...updateValues, joinDate: joinDate };
    }

    if (approverId) {
      updateValues = { ...updateValues, approverId: approverId };
    }
    // if (status) {
    //   updateValues = { ...updateValues, approverId: status };
    // }

    const policy = await Policy.update(
      {
        ...updateValues,
        ...req.body,
        updatedBy: String(req?.auth?.payload?.user),
      },
      {
        returning: true,
        where: { id: policyId },
      },
    );

    if (!policy[0]) {
      return res.status(400).json({
        success: false,
        message: "Error, policy not found",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Policy updated", data: policy[1][0] });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: "Error, unable to update policy",
      err,
    });
  }
};

// @description Delete policy
export const deletePolicy = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { policyId } = req.params;
    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Error policy id is missing",
      });
    }

    const policyMember = await PolicyMember.destroy({
      where: { policyId: policyId },
      returning: true,
      transaction: t,
    });

    console.log(`Policy Member: ${JSON.stringify(policyMember)}`);

    if (!policyMember[0]) {
      return res.status(400).json({
        success: false,
        message: "Error, policy not found",
      });
    }

    await policyMember.map(async (member: any) => {
      await Member.destroy({
        where: { id: member.memberId },
        transaction: t,
      });
    });

    const policy = await Policy.destroy({
      where: { id: policyId },
      returning: true,
      transaction: t,
    });

    t.commit();

    return res.status(200).json({ success: true, message: "Policy deleted" });
  } catch (err) {
    t.rollback();
    return res.status(400).json({
      success: false,
      message: "Error, unable to delete policy",
      err,
    });
  }
};

// @description bulk update policies from one status to another
export const bulkUpdatePolicies = async (req: Request, res: Response) => {
  try {
    const { status, policyIds } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Error, status is missing",
      });
    }

    // only allow status to change to submitted or approved

    if (!policyIds || policyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, policy ids are missing",
      });
    }

    let orgStatus: string = "Ready";
    if (status === "Approved") {
      orgStatus = "Submitted";
    }

    const policies = await Policy.update(
      {
        status: status,
        updatedBy: String(req?.auth?.payload?.user),
      },
      {
        where: {
          id: policyIds,
          status: orgStatus,
        },
      },
    );

    if (policies[0] === 0) {
      return res.status(400).json({
        success: false,
        message: `Error, no policies updated`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policies updated",
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      success: false,
      message: "Error, unable to update policies",
      err,
    });
  }
};
