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
} = require("../models");
const { Op } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { addIDVOPD } from "./vopd";

import { getAgeByPolicyJoinDate } from "../utils/dates";
import { RolePlayerTypeEnums } from "../enums/rolePlayerTypeEnums";
import { logger } from "../middleware/logger";
import { add } from "winston";
import { stat } from "fs";

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

// @description Get all policies loaded for scheme or rep
export const getAllEdits = async (req: Request, res: Response) => {
  try {
    const { createdBy, allocatedApprover, status } = req.query;

    let actionType: string = "NA";
    // check if word onboarding in req.baseUrl
    // if (req.baseUrl.includes("onboarding")) {
    //   actionType = "ADD";
    // } else {
    actionType = "UPDATE";
    // }

    let whereCondition: object = { actionType: actionType };

    if (createdBy) {
      whereCondition = {
        ...whereCondition,
        createdBy: String(req?.auth?.payload?.user),
      };
    }

    if (allocatedApprover) {
      whereCondition = {
        ...whereCondition,
        approverId: String(req?.auth?.payload?.user),
      };
    }

    if (status) {
      whereCondition = {
        ...whereCondition,
        status: status,
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
        "policyNumber",
        "policyId",
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
        },
        {
          model: BrokerageRepresentativeMap,
          required: true,
          attributes: ["brokerageId", "representativeId"],
          where: brokerWhereCondition,
        },
      ],
      where: whereCondition,
      order: [["id", "DESC"]],
      distinct: true,
    });

    if (count === 0) {
      return res.status(200).json({
        success: false,
        message: "No policies found",
      });
    }

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
    // console.log(err);
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
          as: "checksEdits",
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

// @description Create new policy edit
export const createEditPolicy = async (req: Request, res: Response) => {
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

    actionType = "UPDATE";

    logger.debug(`Action Type: ${actionType}`);

    const validateMembers = await members.map((member: any) => {
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
      member.PolicyMember["status"] =
        actionType === "ADD" ? "New" : member.PolicyMember.status;

      // main member
      if (
        member.PolicyMember.roleplayerTypeId ===
        RolePlayerTypeEnums.MAIN_MEMBER_SELF
      ) {
        mainMemberCount++;
      }
      // spouse
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.SPOUSE
      ) {
        spouseCount++;
      }
      // children
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.CHILD
      ) {
        childrenCount++;
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
      }

      // Validate preferred communication
      const commTypeId = String(
        member.preferredCommunicationTypeId ||
          member.PreferredCommunicationTypeId ||
          "",
      );

      if (commTypeId === "1") {
        if (!member.emailAddress && !member.EmailAddress) {
          member.PolicyMember.exceptions.push(
            "Email address is required for preferred communication",
          );
          memberErrors = true;
        } else if (!emailValidator(member.emailAddress || member.EmailAddress)) {
          member.PolicyMember.exceptions.push("Email address is invalid");
          memberErrors = true;
        }
      } else if (commTypeId === "2" || commTypeId === "3") {
        if (!member.cellNumber && !member.MobileNumber) {
          member.PolicyMember.exceptions.push(
            "Mobile number is required for preferred communication",
          );
          memberErrors = true;
        } else if (
          !contactNoValidator(member.cellNumber || member.MobileNumber)
        ) {
          member.PolicyMember.exceptions.push("Mobile number is invalid");
          memberErrors = true;
        }
      }

      return member;
    });

    let policyStatus: String = "Draft";
    // if memberErrors, set status to Error
    if (memberErrors) {
      policyStatus = "Error";
    } else if (status) {
      policyStatus = status;
    }

    // VALIDATION END

    let brokerageMap = await BrokerageRepresentativeMap.findOne({
      where: {
        brokerageId: brokerageId,
        representativeId: representativeId,
      },
    });

    // console.log(`Brokerage Map: ${JSON.stringify(brokerageMap)}`);

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

    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Policy id is missing",
      });
    }

    if (!policyNumber) {
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
    else {
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
            SchemeRolePlayerId === 0 || !SchemeRolePlayerId ? null : providerId,
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
              // console.log(member.PolicyMember);
              member.PolicyMember.policyId = PolicyCreated.id;
              member.PolicyMember.CoverAmount =
                member.PolicyMember.benefitAmount;
              member.PolicyMember.startDate = member.PolicyMember.startDate;
              member.PolicyMember.endDate = member.PolicyMember.endDate;
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
              CoverAmount: member.PolicyMember.benefitAmount,
              startDate: member.PolicyMember.startDate,
              endDate: member.PolicyMember.endDate,
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
    // console.log(JSON.stringify(req.body));
    // console.log(`hitting this ${err}`);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Update policy
export const updateEditPolicy = async (req: Request, res: Response) => {
  try {
    const {
      joinDate,
      members,
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
      policyCancelReasonId,
    } = req.body;

    const { id } = req.params;

    // if no id is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Error, id is missing",
      });
    }

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

    // make sure brokerageId exists
    // if (!brokerageId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Brokerage id is missing",
    //   });
    // }

    // make sure representativeId exists
    // if (!representativeId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Representative id is missing",
    //   });
    // }

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

    actionType = "UPDATE";

    logger.debug(`Action Type: ${actionType}`);

    const validateMembers = await members.map((member: any) => {
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
      member.PolicyMember["status"] =
        actionType === "ADD" ? "New" : member.PolicyMember.status;

      // if member.PolicyMember["status"] === "Deleted" and current date < 28th of month then set endDate to last day of current month else set to 28th of next month
      if (member.PolicyMember["status"] === "Deleted") {
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const nextMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 2,
          0,
        );
        member.PolicyMember["endDate"] =
          today.getDate() < 28 ? lastDay : nextMonth;
      } else if (member.PolicyMember["endDate"]) {
        member.PolicyMember["endDate"] = null;
      }

      // main member
      if (
        member.PolicyMember.roleplayerTypeId ===
        RolePlayerTypeEnums.MAIN_MEMBER_SELF
      ) {
        mainMemberCount++;
      }
      // spouse
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.SPOUSE
      ) {
        spouseCount++;
      }
      // children
      else if (
        member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.CHILD
      ) {
        childrenCount++;
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
      }

      // Validate preferred communication
      const commTypeId = String(
        member.preferredCommunicationTypeId ||
          member.PreferredCommunicationTypeId ||
          "",
      );

      if (commTypeId === "1") {
        if (!member.emailAddress && !member.EmailAddress) {
          member.PolicyMember.exceptions.push(
            "Email address is required for preferred communication",
          );
          memberErrors = true;
        } else if (!emailValidator(member.emailAddress || member.EmailAddress)) {
          member.PolicyMember.exceptions.push("Email address is invalid");
          memberErrors = true;
        }
      } else if (commTypeId === "2" || commTypeId === "3") {
        if (!member.cellNumber && !member.MobileNumber) {
          member.PolicyMember.exceptions.push(
            "Mobile number is required for preferred communication",
          );
          memberErrors = true;
        } else if (
          !contactNoValidator(member.cellNumber || member.MobileNumber)
        ) {
          member.PolicyMember.exceptions.push("Mobile number is invalid");
          memberErrors = true;
        }
      }

      return member;
    });

    let policyStatus: String = "Draft";
    // if memberErrors, set status to Error
    if (memberErrors) {
      policyStatus = "Error";
    } else if (status) {
      policyStatus = status;
    }

    // VALIDATION END

    // let brokerageMap = await BrokerageRepresentativeMap.findOne({
    //   where: {
    //     brokerageId: brokerageId,
    //     representativeId: representativeId,
    //   },
    // });

    // console.log(`Brokerage Map: ${JSON.stringify(brokerageMap)}`);

    // if (!SchemeRolePlayerId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Scheme role player id is missing",
    //   });
    // }

    // if (!providerInceptionDate) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Provider inception date is missing",
    //   });
    // }

    // // check joinDate is not before inception date
    // if (new Date(joinDate) < new Date(providerInceptionDate)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Join date cannot be before inception date",
    //   });
    // }

    // if (!policyId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Policy id is missing",
    //   });
    // }

    // if (!policyNumber) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Policy number is missing",
    //   });
    // }

    const findPolicy = await Policy.findByPk(id);

    if (!findPolicy) {
      return res.status(400).json({
        success: false,
        message: "Policy not found",
      });
    }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let createPolicy_id: number = 0;
    let PolicyCreated: any = {};
    let createMember: any = {};
    try {
      // if no brokerage map exists, create one
      // if (!brokerageMap) {
      //   brokerageMap = await BrokerageRepresentativeMap.create(
      //     {
      //       brokerageId: brokerageId,
      //       representativeId: representativeId,
      //     },
      //     {
      //       validate: true,
      //       transaction: t,
      //     },
      //   );
      // }

      logger.debug("Policy Update");
      // policy update
      await Policy.update(
        {
          coverAmount: coverAmount,
          selectedCategory: selectedCategory,
          updatedBy: String(req?.auth?.payload?.user),
          status: policyStatus,
          statusNote: statusNote,
          policyStatusId: policyStatusId,
          policyCancelReasonId: policyCancelReasonId,
        },
        {
          where: {
            id: id,
          },
          transaction: t,
          validate: true,
        },
      );

      let roleplayerTypeId: number = 0;
      // add createdBy and updatedBy to members
      const membersWithCreatedBy = await members.map((member: any) => {
        // console.log(`Members: ${JSON.stringify(member)}`);
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
          // console.log(member.PolicyMember);

          member.PolicyMember.policyId = id;
          member.PolicyMember.CoverAmount = member.PolicyMember.benefitAmount;
          member.PolicyMember.startDate = member.PolicyMember.startDate;
          member.PolicyMember.endDate = member.PolicyMember.endDate;
          member.PolicyMember.createdBy =
            member.PolicyMember.createdBy || String(req?.auth?.payload?.user);
          member.PolicyMember.updatedBy = String(req?.auth?.payload?.user);
        }

        member.createdBy = member.createdBy || String(req?.auth?.payload?.user);
        member.updatedBy = String(req?.auth?.payload?.user);

        // TODO Address validation

        // TODO cell number validation
        // console.log(`Members: ${JSON.stringify(member)}`);
        return member;
      });

      // order members by member type id
      membersWithCreatedBy.sort((a: any, b: any) =>
        a.PolicyMember.memberTypeId > b.PolicyMember.memberTypeId ? 1 : -1,
      );

      // check if id exists in membersWithCreatedBy
      let mainMemberId: number = 0;
      // let createPolicyMember: any = {};
      // console.log(membersWithCreatedBy);

      // console.log("membersWithCreatedBy", membersWithCreatedBy);
      const promises = await membersWithCreatedBy.map(async (member: any) => {
        // run different query if id exists

        if (member.id) {
          await Member.update(
            {
              firstName: member.firstName,
              surname: member.surname,
              preferredCommunicationTypeId: member.preferredCommunicationTypeId,
              tellNumber: member.tellNumber,
              cellNumber: member.cellNumber,
              emailAddress: member.emailAddress,
              addressLine1: member.addressLine1,
              addressLine2: member.addressLine2,
              postalCode: member.postalCode,
              city: member.city,
              province: member.province,
              isDeleted: member.isDeleted,
              updatedBy: String(req?.auth?.payload?.user),
            },
            {
              where: {
                id: member.id,
              },
              transaction: t,
              validate: true,
              individualHooks: true,
            },
          );
          await PolicyMember.update(
            {
              statedBenefit: member.PolicyMember.statedBenefit,
              statedBenefitId: member.PolicyMember.statedBenefitId,
              memberTypeId: member.PolicyMember.memberTypeId,
              isDeleted: member.PolicyMember.isDeleted,
              status: member.PolicyMember.isDeleted
                ? "Deleted"
                : member.PolicyMember.status,
              endDate: member.PolicyMember.endDate || null,
              PolicyMemberStatusId: member.PolicyMember.PolicyMemberStatusId,
              PolicyMemberStatusReason:
                member.PolicyMember.PolicyMemberStatusReason,
            },
            {
              where: {
                PolicyMemberId: member.PolicyMember.PolicyMemberId,
              },
              transaction: t,
              validate: true,
              individualHooks: true,
            },
          );
        } else {
          // console.log(`create member ${JSON.stringify(member)}`);
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
    } catch (err: any) {
      console.log(`hitting this update ${err}`);
      await t.rollback();
      return res.status(400).json(sequelizeErrorHandler(err));
    }
    // console.log(brokerageMap);
    const policy = await Policy.findOne({
      where: {
        id: id,
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
        // brokerageId: brokerageMap.dataValues.brokerageId,
        // representativeId: brokerageMap.dataValues.representativeId,
        ...policy.dataValues,
      },
    });
  } catch (err: any) {
    // console.log(JSON.stringify(req.body));
    // console.log(`hitting this ${err}`);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};
