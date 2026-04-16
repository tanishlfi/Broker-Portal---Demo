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

  BrokerageRepresentativeMap,
  policyNote,
  sequelize,

  PolicyCheck,
  onboardingData,
  onboardingPolicy,
  onboarding_logs,
} = require("../models");

const { Op, QueryTypes, literal } = require("sequelize");

import { sequelizeErrorHandler } from "../middleware/sequelize_error";

import { getAgeByPolicyJoinDate } from "../utils/dates";

import { logger } from "../middleware/logger";

import { TableHints, where } from "sequelize";
import { table } from "console";

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

const PolicyStatus = {
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETE: "Complete",
  PROCESSING: "Processing",
  // Add other statuses if used elsewhere
};

export const getAllPoliciesSchemeOrRep = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      productTypeId,
      providerId,
      memberTypeId, // Note: memberTypeId is used for memberWhereCondition, not policy
      createdBy: createdByParam, // Renamed to avoid conflict with auth user
      limit,
      page,
      status: statusParam,
      idNumber,
      brokerageId: brokerageIdParam, // Renamed for clarity
      allocatedApprover,
      manual,
      uniqueId,
    } = req.query;

    let fileId = req.query.fileId || null; // Default to null if not provided

    if (typeof fileId === "string") {
      fileId = fileId.trim() || null; // Ensure fileId is a string or null
    }

    const currentUser = String(req?.auth?.payload?.user);

    let whereCondition: any = {}; // Use 'any' for flexibility, or define a stricter type

    if (uniqueId) {
      // get file ID from uniqueId
      const file = await File.findOne({
        attributes: ["id"],
        where: { uniqueId: uniqueId },
      });
      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found with the provided unique ID.",
        });
      }
      fileId = file.id; // Set fileId to the found file's ID
    }

    if (manual === "true") {
      // Be explicit with boolean conversion
      whereCondition.fileId = null;
    }

    if (productTypeId) whereCondition.productTypeId = productTypeId;
    if (providerId) whereCondition.providerId = providerId;

    // Filter by policies created by the logged-in user
    if (createdByParam === "true") {
      whereCondition.createdBy = currentUser;
    } else if (createdByParam && typeof createdByParam === "string") {
      whereCondition.createdBy = createdByParam;
    }

    if (allocatedApprover === "true") {
      whereCondition.approverId = currentUser;
      // If statusParam is also provided, it will override this.
      // Decide precedence: does statusParam override allocatedApprover's statuses?
      // Or should they be combined?
      if (!statusParam) {
        whereCondition.status = [
          PolicyStatus.SUBMITTED,
          PolicyStatus.APPROVED,
          PolicyStatus.REJECTED,
          PolicyStatus.COMPLETE,
        ];
      }
    }

    if (statusParam) {
      whereCondition.status = statusParam; // This will override status from allocatedApprover block if both are true
    } else if (!allocatedApprover && !fileId) {
      // Default status filtering if no specific status, not allocatedApprover and not a file-specific search
      whereCondition.status = {
        [Op.notIn]: [
          PolicyStatus.SUBMITTED,
          PolicyStatus.APPROVED,
          PolicyStatus.COMPLETE,
          PolicyStatus.PROCESSING,
        ],
      };
    }

    let memberWhereCondition: any = {};
    let altQuery: boolean = false; // Flag to determine if we need to use an alternative query
    if (idNumber) {
      // memberWhereCondition.idNumber = {
      //   [Op.like]: `%${idNumber}%`, // WARNING: Slow. Consider Op.startsWith or Full-Text Search
      // };

      altQuery = true; // Set flag to true if idNumber is used

      // remove statusParam if Id Number is provided
      if (statusParam) {
        delete whereCondition.status; // Remove statusParam if idNumber is provided
      }
    }
    // else if (!fileId) {
    //   // Only set memberTypeId if not searching by idNumber AND not by fileId
    //   memberWhereCondition.memberTypeId = 1; // Assuming 1 is a valid ID
    // }

    const rmaAppRoles = Array.isArray(req?.auth?.payload?.rmaAppRoles)
      ? req?.auth?.payload?.rmaAppRoles
      : [];
    const rmaAppUserMetaData: { BrokerageIds?: string[] } =
      req?.auth?.payload?.rmaAppUserMetadata || {};

    // Brokerage filtering logic
    const isBrokerRole =
      rmaAppRoles?.includes("CDA-BROKERAGE-Broker Manager") ||
      rmaAppRoles?.includes("CDA-BROKERAGE-Broker Representative");

    if (isBrokerRole) {
      if (
        !rmaAppUserMetaData?.BrokerageIds ||
        rmaAppUserMetaData?.BrokerageIds?.length === 0
      ) {
        return res.status(200).json({
          // 200 with success:false
          success: false,
          message:
            "User is not associated with any brokerage or no policies found.",
          data: [],
          count: 0,
          status: statusParam || "Any",
        });
      }
      whereCondition.brokerageId = { [Op.in]: rmaAppUserMetaData.BrokerageIds }; // Use Op.in for array
    } else if (brokerageIdParam) {
      // If not a broker role, but brokerageIdParam is provided
      whereCondition.brokerageId = brokerageIdParam;
    }

    let fileWhereCondition: any = {};
    let fileWhereRequired: boolean = false;

    // --- PAGINATION ---
    const pageNumber = parseInt(String(page), 10) || 1;
    let pageSize = parseInt(String(limit), 10) || 20; // Default page size
    let offset = (pageNumber - 1) * pageSize;
    if (fileId) {
      fileWhereRequired = true;
      fileWhereCondition.id = fileId;
      whereCondition.fileId = fileId;
    }

    if (altQuery) {
      const result = await sequelize.query(
        `
  SELECT DISTINCT
    [onboardingPolicy].[id]
  FROM [onboarding].[onboardingPolicies] AS [onboardingPolicy] (nolock)
  INNER JOIN [onboarding].[onboardingData] AS [members]  (nolock)
    ON [onboardingPolicy].[id] = [members].[policyId]
    AND [members].[deletedAt] IS NULL AND [members].[alsoMember] = 0 AND [members].[idNumber] LIKE ${sequelize.escape(
      `${idNumber}%`,
    )}
  WHERE [onboardingPolicy].[deletedAt] IS NULL
  ORDER BY [onboardingPolicy].[id] DESC
`,
        {
          type: QueryTypes.SELECT,
          nest: true,
          raw: true,
          replacements: {
            idNumber,
          },
        },
      );
      const policyIds = result.map((policy: any) => policy.id);
      // console.log(`Policy IDs found: ${JSON.stringify(policyIds)}`);

      whereCondition = {
        ...whereCondition,
        id: { [Op.in]: policyIds }, // Filter policies by found IDs
      };
    }

    const queryOptions: any = {
      attributes: [
        "createdAt",
        "joinDate",
        "status",
        "statusNote",
        "providerId",
        "id",
        "approverId",
        "providerName",
        "brokerageName",
        "createdBy",
        "fileId",
      ],
      include: [
        //   {
        //     model: onboardingData,
        //     as: "members",
        //     attributes: [
        //       "firstName",
        //       "surname",
        //       "idNumber",
        //       "memberType",
        //       "memberTypeId",
        //       "exceptions",
        //     ],
        //     required: true,
        //     where: memberWhereCondition,
        //   },
        // {
        //   model: File,
        //   as: "File",
        //   attributes: ["orgFileName", "id"],
        //   required: fileWhereRequired,
        //   where: fileWhereCondition,
        //   tableHint: TableHints.NOLOCK,
        // },
      ],
      where: whereCondition,
      order: [["id", "DESC"]],
      tableHint: TableHints.NOLOCK,
    };

    // Only add pagination if no fileId
    if (!fileId) {
      queryOptions.limit = pageSize;
      queryOptions.offset = offset;
    }

    const rows = await onboardingPolicy.findAll(queryOptions);
    const count = await onboardingPolicy.count({
      where: whereCondition,
      tableHint: TableHints.NOLOCK,
    });

    if (rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No policies found",
        data: [],
        count: 0,
        status: statusParam || "Any",
      });
    }

    // add policyIds from rows to memberWhereCondition
    const policyIds = rows.map((policy: any) => policy.id);
    memberWhereCondition.policyId = { [Op.in]: policyIds };

    const getMembersQuery: any = {
      attributes: [
        "firstName",
        "surname",
        "idNumber",
        "memberType",
        "memberTypeId",
        "exceptions",
        "policyId",
      ],
      where: memberWhereCondition,
      TableHints: TableHints.NOLOCK,
    };
    const members = await onboardingData.findAll(getMembersQuery);

    // add members to rows
    rows.forEach((policy: any) => {
      policy.dataValues.members = members.filter(
        (member: any) => member.policyId === policy.id,
      );
    });

    // add fileId from rows to fileWhereCondition
    fileWhereCondition.id = {
      [Op.in]: rows.map((policy: any) => policy.fileId),
    };

    const files = await File.findAll({
      attributes: ["orgFileName", "id", "uniqueId"],
      where: fileWhereCondition,
      tableHint: TableHints.NOLOCK,
      paranoid: false,
    });

    // add file to rows
    rows.forEach((policy: any) => {
      policy.dataValues.file = files.find(
        (file: any) => file.id === policy.fileId,
      );
    });

    const policies = rows.map((policy: any) => {
      let exceptionCount = 0;
      // Calculate exceptionCount only if fileId was part of the search criteria
      // and thus members are filtered/relevant in that context
      if (fileId && policy.dataValues.members) {
        policy.dataValues.members.forEach((member: any) => {
          if (member.exceptions && Array.isArray(member.exceptions)) {
            exceptionCount += member.exceptions.length;
          }
        });
        // This filter might be redundant if memberWhereCondition already filters by memberTypeId
        // when fileId is present (currently it doesn't if idNumber is also present).
        // Re-evaluate if this client-side filter is still needed after DB query adjustments.
        // if (altQuery) {
        //   // filter using idNumber
        //   policy.dataValues.members = policy.dataValues.members.filter(
        //     (member: any) => member.idNumber === idNumber,
        //   );
        // }
        // else {
        policy.dataValues.members = policy.dataValues.members.filter(
          (member: any) => member.memberTypeId === 1,
        );
        // }
      }

      return {
        ...policy.dataValues,
        exceptionCount, // ensure this is outside dataValues or inside as per desired structure
      };
    });

    return res.status(200).json({
      success: true,
      message: "Policies found",
      count: count, // Total count from findAndCountAll
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(count / pageSize),
      status: statusParam || "Any",
      data: policies,
    });
  } catch (err: any) {
    console.error("Error fetching policies:", err); // Log the actual error
    // return res.status(400).json(sequelizeErrorHandler(err)); // Assuming this formats the error
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occurred." }); // Generic error
  }
};

// // @description Get all policies loaded for scheme or rep
// export const getAllPoliciesSchemeOrRep = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const {
//       productTypeId,
//       providerId,
//       memberTypeId,
//       createdBy,
//       limit,
//       page,
//       status,
//       idNumber,
//       // fileName,
//       fileId,
//       brokerageId,
//       allocatedApprover,
//       manual,
//     } = req.query;

//     let actionType: string = "NA";

//     let whereCondition: object = {};

//     if (manual) {
//       whereCondition = {
//         ...whereCondition,
//         fileId: null,
//       };
//     }

//     if (productTypeId) {
//       whereCondition = {
//         ...whereCondition,
//         productTypeId: productTypeId,
//       };
//     }

//     if (providerId) {
//       whereCondition = {
//         ...whereCondition,
//         providerId: providerId,
//       };
//     }

//     if (createdBy) {
//       whereCondition = {
//         ...whereCondition,
//         createdBy: String(req?.auth?.payload?.user),
//       };
//     }

//     if (allocatedApprover) {
//       whereCondition = {
//         ...whereCondition,
//         approverId: String(req?.auth?.payload?.user),
//         status: ["Submitted", "Approved", "Rejected", "Complete"],
//       };
//     }

//     if (status) {
//       whereCondition = {
//         ...whereCondition,
//         status: status,
//       };
//     } else if (!allocatedApprover && !fileId) {
//       whereCondition = {
//         ...whereCondition,
//         status: {
//           [Op.notIn]: ["Submitted", "Approved", "Complete", "Processing"],
//         },
//       };
//     }

//     let memberWhereCondition: object = {};
//     if (idNumber) {
//       memberWhereCondition = {
//         idNumber: {
//           [Op.like]: `%${idNumber}%`,
//         },
//       };
//     } else if (!fileId) {
//       memberWhereCondition = {
//         ...memberWhereCondition,
//         memberTypeId: 1,
//       };
//     }

//     const rmaAppRoles = Array.isArray(req?.auth?.payload?.rmaAppRoles)
//       ? req?.auth?.payload?.rmaAppRoles
//       : [];
//     const rmaAppUserMetaData: { BrokerageIds?: string[] } =
//       req?.auth?.payload?.rmaAppUserMetadata || {};

//     let brokerWhereCondition: object = {};

//     if (
//       rmaAppRoles &&
//       (rmaAppRoles.includes("CDA-BROKERAGE-Broker Manager") ||
//         rmaAppRoles.includes("CDA-BROKERAGE-Broker Representative"))
//     ) {
//       if (!rmaAppUserMetaData?.BrokerageIds) {
//         return res.status(200).json({
//           success: false,
//           message: "No policies found",
//         });
//       }

//       whereCondition = {
//         ...whereCondition,
//         brokerageId: rmaAppUserMetaData?.BrokerageIds,
//       };
//     }

//     let fileWhereCondition: object = {};
//     let fileWhereRequired: boolean = false;

//     if (fileId) {
//       fileWhereRequired = true;
//       fileWhereCondition = {
//         id: fileId,
//       };
//     }

//     if (brokerageId) {
//       brokerWhereCondition = {
//         brokerageId: brokerageId,
//       };
//     }

//     const { count, rows } = await onboardingPolicy.findAndCountAll({
//       attributes: [
//         "createdAt",
//         "joinDate",
//         "status",
//         "statusNote",
//         "providerId",
//         "id",
//         "approverId",
//         "providerName",
//         "brokerageName",
//         "createdBy",
//       ],
//       include: [
//         {
//           model: onboardingData,
//           as: "members",
//           attributes: [
//             "firstName",
//             "surname",
//             "idNumber",
//             "memberType",
//             "memberTypeId",
//             "exceptions",
//           ],
//           required: true,
//           where: memberWhereCondition,
//         },
//         {
//           model: File,
//           attributes: ["orgFileName", "id"],
//           required: fileWhereRequired,
//           where: fileWhereCondition,
//         },
//       ],
//       where: whereCondition,
//       order: [["id", "DESC"]],

//       distinct: true,
//       tableHint: TableHints.NOLOCK,
//     });

//     if (rows.length === 0) {
//       return res.status(200).json({
//         success: false,
//         message: "No policies found",
//       });
//     }

//     const policies = rows.map((policy: any) => {
//       let exceptionCount: Number = 0;

//       if (fileId) {
//         policy.dataValues.members.forEach((member: any) => {
//           if (member.exceptions) {
//             exceptionCount += member.exceptions.length;
//           }
//         });

//         policy.dataValues.members = policy.dataValues.members.filter(
//           (member: any) => member.memberTypeId === 1,
//         );
//       }

//       return {
//         exceptionCount: exceptionCount,
//         ...policy.dataValues,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Policies found",
//       count: count,

//       status: status || "Any",
//       data: policies,
//     });
//   } catch (err: any) {
//     console.log(err);
//     return res.status(400).json(sequelizeErrorHandler(err));
//   }
// };

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
        message: "Not Authorized",
      });
    }

    let brokerWhereCondition: object = {};
    // if 'CDA-BROKERAGE-Broker Manager' in appUserType then print brokerageIds
    if (
      rmaAppRoles?.includes("CDA-BROKERAGE-Broker Manager") ||
      rmaAppRoles?.includes("CDA-BROKERAGE-Broker Representative")
    ) {
      if (!rmaAppUserMetaData?.BrokerageIds) {
        return res.status(200).json({
          success: false,
          message: "No policies found ",
        });
      }
      brokerWhereCondition = {
        brokerageId: {
          [Op.in]: rmaAppUserMetaData?.BrokerageIds,
        },
      };
    }

    // if (rmaAppRoles?.includes("CDA-BROKERAGE-Broker Representative")) {
    //   whereCondition = {
    //     ...whereCondition,
    // createdBy: String(req?.auth?.payload?.user),
    // [Op.or]: [
    //   { createdBy: String(req?.auth?.payload?.user) },
    //   { updatedBy: String(req?.auth?.payload?.user) },
    // ],
    //   };
    // }

    const policies = await onboardingPolicy.findOne({
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
          TableHints: TableHints.NOLOCK,
          paranoid: false,
          where: { [Op.or]: [{ alsoMember: 0 }, { alsoMember: null }] },
        },
        {
          model: PolicyCheck,
          as: "checks",
          required: false,
          attributes: ["id", "checkDescr", "status", "updatedAt"],
        },
        {
          model: File,
          attributes: ["orgFileName"],
          required: false,
        },
        {
          model: onboarding_logs,
        },
      ],
      where: whereCondition,
      tableHint: TableHints.NOLOCK,
      paranoid: false,
    });

    console.log(`Policies: ${JSON.stringify(policies)}`);

    if (!policies) {
      return res.status(200).json({
        success: false,
        message: "No policy found",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Policy found", data: policies });
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
      joinDate,
      members,
      productType,
      providerId,
      coverAmount,
      productOptionId,
      brokerageId,
      providerInceptionDate,
      status,
      statusNote,
      brokerageName,
      providerName,
      allowDuplicate,
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

    // calculate minimum join date, it is the 1st of the current month if  the current date is before the 15th of the month else it is the 1st of the next month
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    let minJoinDate: Date = new Date(currentYear, currentMonth, 1);
    if (currentDay > 15) {
      minJoinDate = new Date(currentYear, currentMonth + 1, 1);
    }

    // check if joinDate is before the minimum join date
    if (new Date(joinDate) < minJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be before ${minJoinDate.toDateString()}`,
      });
    }

    // get maximum join date, it is 3 months from the current min join date
    const maxJoinDate: Date = new Date(minJoinDate);
    maxJoinDate.setMonth(maxJoinDate.getMonth() + 3);

    // check if joinDate is after the maximum join date
    if (new Date(joinDate) > maxJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be after ${maxJoinDate.toDateString()}`,
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
        member.memberTypeId === 1 || member.memberType === "Main Member",
    );
    if (!memberTypeId) {
      return res.status(400).json({
        success: false,
        message: "Error, no main member provided",
      });
    } else {
      // member.isVopdVerified = true then set mainMemberVOPDDone to true
      // console.log(`Member Type ID: ${JSON.stringify(memberTypeId)}`);
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

    const validateMembers = await members.map((member: any) => {
      // reset exceptions array
      member["exceptions"] = [];

      if (
        member.preferredCommunicationTypeId &&
        member.preferredCommunicationTypeId !== "" &&
        !["1", "3"].includes(String(member.preferredCommunicationTypeId))
      ) {
        member["exceptions"].push({
          message: `Invalid communication method. Only Email and SMS are allowed.`,
          field: "preferredCommunicationTypeId",
        });
        memberErrors = true;
      }

      // check if firstName is provided
      if (!member.firstName) {
        member["exceptions"].push({
          message: `No first name provided`,
          field: "firstName",
        });
        memberErrors = true;
      }
      // check if firstName is empty
      else if (member.firstName.trim() === "") {
        member["exceptions"].push({
          message: `First name is empty`,
          field: "firstName",
        });
        memberErrors = true;
      }

      // check if surname is provided
      if (!member.surname) {
        member["exceptions"].push({
          message: `No surname provided`,
          field: "surname",
        });
        memberErrors = true;
      }
      // check if surname is empty
      else if (member.surname.trim() === "") {
        member["exceptions"].push({
          message: `No surname provided`,
          field: "surname",
        });
        memberErrors = true;
      }

      // check if ID number is provided
      if (!member.idNumber) {
        member["exceptions"].push({
          message: `No ID number provided`,
          field: "idNumber",
        });
        memberErrors = true;
      }

      // check if ID number is valid
      if (member.idTypeId === 1 && !SAIDValidator(member.idNumber)) {
        member["exceptions"].push({
          message: `Invalid ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      }

      // check if ID number is unique
      if (idNumberList.includes(member.idNumber)) {
        member["exceptions"].push({
          message: `Duplicate ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      } else if (member.idTypeId === 1) {
        idNumberList.push(member.idNumber);
      }

      if (member.cellNumber) {
        const validatedCell = contactNoValidator(member.cellNumber);
        if (!validatedCell) {
          member["exceptions"].push({
            message: `Invalid Contact Numbers`,
            field: "cellNumber",
          });
          memberErrors = true;
        } else {
          member.cellNumber = validatedCell;
        }
      }

      // check if VOPD response is provided if it is check if person is deceased

      if (member.isVopdVerified) {
        member.isDeceased = member?.vopdResponse?.dateOfDeath ? true : false;
        member.dateOfDeath = member?.vopdResponse?.dateOfDeath;
        member.dateVopdVerified = member?.vopdResponse?.updatedAt;

        if (member.isDeceased) {
          member["exceptions"].push({
            message: `Deceased person`,
            field: "isDeceased",
          });
          memberErrors = true;
        }
      }

      // check preferredCommunicationTypeId === 1 and emailAddress is null then exceptions
      if (member.preferredCommunicationTypeId === "1" && !member.emailAddress) {
        member["exceptions"].push({
          message: `Email address is required for preferred communication`,
          field: "emailAddress",
        });
        memberErrors = true;
      }

      if (member.preferredCommunicationTypeId === "3" && !member.cellNumber) {
        member["exceptions"].push({
          message: `Cell phone number is required for preferred communication`,
          field: "cellNumber",
        });
        memberErrors = true;
      }

      // check that if PreviousInsurer or PreviousInsurerPolicyNumber or PreviousInsurerJoinDate or PreviousInsurerCancellationDate is set, all must be set
      if (
        (member.PreviousInsurer ||
          member.PreviousInsurerPolicyNumber ||
          member.PreviousInsurerJoinDate ||
          member.PreviousInsurerCancellationDate) &&
        (!member.PreviousInsurer ||
          !member.PreviousInsurerPolicyNumber ||
          !member.PreviousInsurerJoinDate ||
          !member.PreviousInsurerCancellationDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer details incomplete`,
          field: null,
        });
        memberErrors = true;
      }

      // check that member.PolicyMember.PreviousInsurerJoinDate is not after PreviousInsurerCancelDate if values are set
      if (
        member.PreviousInsurerJoinDate &&
        member.PreviousInsurerCancellationDate &&
        new Date(member.PreviousInsurerJoinDate) >=
          new Date(member.PreviousInsurerCancellationDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer join date cannot be on or after cancel date`,
          field: "member.PreviousInsurerJoinDate",
        });
        memberErrors = true;
      }

      // if previous insurer join date is set, check that previous insurer join date is not after join date
      if (
        member.PreviousInsurerJoinDate &&
        new Date(member.PreviousInsurerJoinDate) >= new Date(joinDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer join date cannot be on or after join date`,
          field: "member.PolicyMember.PreviousInsurerJoinDate",
        });
        memberErrors = true;
      }

      // if previous insurer cancel date is set, check that previous insurer cancel date is not after join date
      if (
        member.PreviousInsurerCancellationDate &&
        new Date(member.PreviousInsurerCancellationDate) >= new Date(joinDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer cancel date cannot be on or after join date`,
          field: "member.PolicyMember.PreviousInsurerCancellationDate",
        });
        memberErrors = true;
      }

      // check that member dob is valid
      if (isNaN(Date.parse(member.dateOfBirth))) {
        member["exceptions"].push({
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
        member["exceptions"].push({
          message: `Invalid age`,
          field: "dateOfBirth",
        });
        memberErrors = true;
      }

      // main member
      if (member.memberTypeId === 1) {
        mainMemberCount++;
        if (mainMemberCount === 1) {
          mainMemberAllocation = member;
        } else if (mainMemberCount > 1) {
          member["exceptions"].push({
            message: `Too many main members`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // spouse
      else if (member.memberTypeId === 2) {
        spouseCount++;
        if (spouseCount === 1) {
          spouseAllocation = member;
        } else if (spouseCount > 1) {
          member["exceptions"].push({
            message: `Too many spouses`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // children
      else if (member.memberTypeId === 3) {
        childrenCount++;
        if (childrenCount > 6) {
          member["exceptions"].push({
            message: `Too many children`,
            field: null,
          });
          memberErrors = true;
        }

        if (
          (member.isDisabled || member.isStudent) &&
          member.supportDocument === null
        ) {
          member["exceptions"].push({
            message: `No support document`,
            field: "supportDocument",
          });
          memberErrors = true;
        }

        // check if child is over 21 years old and not a student or disable
        if (memberAge > 21 && !member.isDisabled && !member.isStudent) {
          member["exceptions"].push({
            message: `Child is over 21 years old and not a student or disabled`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // extended family
      else if (member.memberTypeId === 4) {
        extendedFamilyCount++;
      } else if (member.memberTypeId === 6) {
        beneficiaryCount++;
      } else {
        unknownCount++;
        // append to member.exceptions array for unknown roleplayerTypeId found
        member["exceptions"].push({
          message: `Unknown roleplayer type`,
          field: null,
        });
        memberErrors = true;
      }

      // check main member
      if (member.memberTypeId === 1) {
        // format tellNumber if specified
        member.tellNumber = member.tellNumber
          ? contactNoValidator(member.tellNumber)
          : null;

        // format cellNumber if specified
        if (member.cellNumber) {
          const validatedCell = contactNoValidator(member.cellNumber);
          if (!validatedCell) {
            member["exceptions"].push({
              message: `Invalid Contact Numbers`,
              field: "cellNumber",
            });
            memberErrors = true;
          } else {
            member.cellNumber = validatedCell;
          }
        }

        if (
          member.idTypeId === 2 &&
          member.idNumber &&
          member.supportDocument.length === 0
        ) {
          member["exceptions"].push({
            message: `No support document`,
            field: "supportDocument",
          });
          memberErrors = true;
        }

        // check if member has valid email if specified
        if (member.emailAddress && !emailValidator(member.emailAddress)) {
          member["exceptions"].push({
            message: `Invalid email`,
            field: "email",
          });
          memberErrors = true;
        }

        // check if member has at least 1 contact method = tellNumber, cellNumber, email
        if (!member.tellNumber && !member.cellNumber && !member.emailAddress) {
          member["exceptions"].push({
            message: `No contact method specified`,
            field: null,
          });
          memberErrors = true;
        }

        if (
          !member.preferredCommunicationTypeId ||
          member.preferredCommunicationTypeId === ""
        ) {
          member.preferredCommunicationTypeId = "3";
        }

        if (
          !["1", "3"].includes(String(member.preferredCommunicationTypeId))
        ) {
          member["exceptions"].push({
            message: `Invalid communication method. Only Email and SMS are allowed.`,
            field: "preferredCommunicationTypeId",
          });
          memberErrors = true;
        }

        if (
          member.preferredCommunicationTypeId === "1" &&
          !member.emailAddress
        ) {
          member["exceptions"].push({
            message: `Email address is required for preferred communication`,
            field: "emailAddress",
          });
          memberErrors = true;
        }

        if (
          member.preferredCommunicationTypeId === "3" &&
          !member.cellNumber
        ) {
          member["exceptions"].push({
            message: `Cell phone number is required for preferred communication`,
            field: "cellNumber",
          });
          memberErrors = true;
        }

        // check if member has preferredCommunicationTypeId specified
        if (!member.preferredCommunicationTypeId) {
          member["exceptions"].push({
            message: `No preferred communication type specified`,
            field: null,
          });
          memberErrors = true;
        }

        // check address details
        if (!member.addressLine1) {
          member["exceptions"].push({
            message: `No address line 1 specified`,
            field: "addressLine1",
          });
          memberErrors = true;
        }

        // postal code needed
        // if (!member.postalCode) {
        //   member.PolicyMember["exceptions"].push({
        //     message: `No postal code specified`,
        //     field: "postalCode",
        //   });
        //   memberErrors = true;
        // }

        // province needed
        // if (!member.province) {
        //   member.PolicyMember["exceptions"].push({
        //     message: `No province specified`,
        //     field: "province",
        //   });
        //   memberErrors = true;
        // }

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
          member["exceptions"].push({
            message: `Invalid province specified`,
            field: "province",
          });
          memberErrors = true;
        }
      }

      // if addressLine1 longer than 50 characters
      if (member.addressLine1 && member.addressLine1.length > 50) {
        member["exceptions"].push({
          message: `Address line 1 too long`,
          field: "addressLine1",
        });
        memberErrors = true;
      }

      // if addressLine2 longer than 50 characters
      if (member.addressLine2 && member.addressLine2.length > 50) {
        member["exceptions"].push({
          message: `Address line 2 too long`,
          field: "addressLine2",
        });
        memberErrors = true;
      }

      // if city longer than 50 characters
      if (member.city && member.city.length > 50) {
        member["exceptions"].push({
          message: `City too long`,
          field: "city",
        });
        memberErrors = true;
      }

      // set is beneficiary
      member.isBeneficiary =
        member.memberTypeId === 6
          ? true
          : member.memberTypeId === 1
          ? true
          : member.isBeneficiary;

      // if member.exceptions is not empty set status to error
      if (member.exceptions.length > 0) {
        member["status"] = "Error";
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

    const policyStatusNote: String =
      policyStatus === "Error" ? "Issue on members" : "Checking Policy";

    // VALIDATION END

    if (productType !== "Scheme") {
      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "Provider id is missing",
        });
      }

      // BrokerageRepresentativeMapId = providerId;
    }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let createPolicy_id: number = 0;
    let PolicyCreated: any = {};
    let createMember: any = {};
    try {
      logger.debug("Policy Create");
      PolicyCreated = await onboardingPolicy.create(
        {
          providerId: providerId,
          ProductOptionId: productOptionId,
          brokerageId: brokerageId,
          providerInceptionDate: providerInceptionDate,
          joinDate: joinDate,
          coverAmount: coverAmount,
          status: policyStatus,
          statusNote: policyStatusNote,
          createdBy: String(req?.auth?.payload?.user),
          updatedBy: String(req?.auth?.payload?.user),
          brokerageName: brokerageName,
          providerName: providerName,
          allowDuplicate: allowDuplicate,
        },
        {
          transaction: t,
          validate: true,
        },
      );

      // create members onboardingData
      const promises: any = await validateMembers.map(async (member: any) => {
        createMember = await onboardingData.create(
          {
            policyId: PolicyCreated.id,
            idValid: SAIDValidator(member.idNumber),
            isVopdVerified: member.isVopdVerified,
            isDeceased: member.isDeceased,
            isBeneficiary: member.isBeneficiary,
            dateOfDeath: member.dateOfDeath,
            dateVopdVerified: member.dateVopdVerified,
            vopdResponse: member.isVopdVerified ? member.vopdResponse : null,
            status: member.status,
            exceptions: member.exceptions,
            client_type: member.client_type,
            memberTypeId: member.memberTypeId,
            firstName: member.firstName,
            surname: member.surname,
            idTypeId: member.idTypeId,
            idNumber: member.idNumber,
            dateOfBirth: member.dateOfBirth,
            statedBenefitId: member.statedBenefitId,
            statedBenefit: member.statedBenefit,
            joinDate: joinDate,
            PreviousInsurerJoinDate: member.PreviousInsurerJoinDate,
            PreviousInsurerCancellationDate:
              member.PreviousInsurerCancellationDate,
            PreviousInsurer: member.PreviousInsurer,
            PreviousInsurerPolicyNumber: member.PreviousInsurerPolicyNumber,
            PreviousInsurerCoverAmount: member.PreviousInsurerCoverAmount,
            addressLine1: member.addressLine1,
            addressLine2: member.addressLine2,
            city: member.city,
            province: member.province,
            postalCode: member.postalCode,
            tellNumber: member.tellNumber,
            cellNumber: member.cellNumber,
            emailAddress: member.emailAddress,
            preferredCommunicationTypeId: member.preferredCommunicationTypeId,
            gender: member.gender,
            isStudent: member.isStudent,
            isDisabled: member.isDisabled,
            supportDocument: member.supportDocument,
            notes: member.notes,
            createdBy: String(req?.auth?.payload?.user),
            updatedBy: String(req?.auth?.payload?.user),
          },
          { transaction: t, validate: true },
        );
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

    const policy = await onboardingPolicy.findOne({
      where: {
        id: createPolicy_id,
      },
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: update ? "Policy Updated" : "Policy created",
      data: {
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
      joinDate,
      members,
      productType,
      providerId,
      coverAmount,
      productOptionId,
      brokerageId,
      providerInceptionDate,
      status,
      statusNote,
      brokerageName,
      providerName,
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

    // if joinDate is  missing
    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is missing",
      });
    }

    // calculate minimum join date, it is the 1st of the current month if  the current date is before the 15th of the month else it is the 1st of the next month
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    let minJoinDate: Date = new Date(currentYear, currentMonth, 1);
    if (currentDay > 15) {
      minJoinDate = new Date(currentYear, currentMonth + 1, 1);
    }

    // check if joinDate is before the minimum join date
    if (new Date(joinDate) < minJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be before ${minJoinDate.toDateString()}`,
      });
    }

    // get maximum join date, it is 3 months from the current min join date
    const maxJoinDate: Date = new Date(minJoinDate);
    maxJoinDate.setMonth(maxJoinDate.getMonth() + 3);

    // check if joinDate is after the maximum join date
    if (new Date(joinDate) > maxJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be after ${maxJoinDate.toDateString()}`,
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
        member.memberTypeId === 1 || member.memberType === "Main Member",
    );
    if (!memberTypeId) {
      return res.status(400).json({
        success: false,
        message: "Error, no main member provided",
      });
    } else {
      // member.isVopdVerified = true then set mainMemberVOPDDone to true
      // console.log(`Member Type ID: ${JSON.stringify(memberTypeId)}`);
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

    // if status is missing
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Error, status is missing",
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

    // VALIDATION END

    if (productType !== "Scheme") {
      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "Provider id is missing",
        });
      }

      // BrokerageRepresentativeMapId = providerId;
    }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let createPolicy_id: number = 0;
    let PolicyCreated: any = {};
    let createMember: any = {};
    try {
      logger.debug("Policy Create");
      PolicyCreated = await onboardingPolicy.create(
        {
          providerId: providerId,
          ProductOptionId: productOptionId,
          brokerageId: brokerageId,
          providerInceptionDate: providerInceptionDate,
          joinDate: joinDate,
          coverAmount: coverAmount,
          status: status,
          statusNote: null,
          createdBy: String(req?.auth?.payload?.user),
          updatedBy: String(req?.auth?.payload?.user),
          brokerageName: brokerageName,
          providerName: providerName,
        },
        {
          transaction: t,
          validate: true,
        },
      );

      // create members onboardingData
      const promises: any = await members.map(async (member: any) => {
        createMember = await onboardingData.create(
          {
            policyId: PolicyCreated.id,
            idValid: SAIDValidator(member.idNumber),
            isVopdVerified: member.isVopdVerified,
            isDeceased: member.isDeceased,
            dateOfDeath: member.dateOfDeath,
            dateVopdVerified: member.dateVopdVerified,
            vopdResponse: member.isVopdVerified ? member.vopdResponse : null,
            status: member.status,
            exceptions: member.exceptions,
            client_type: member.client_type,
            memberTypeId: member.memberTypeId,
            firstName: member.firstName,
            surname: member.surname,
            idTypeId: member.idTypeId,
            idNumber: member.idNumber,
            dateOfBirth: member.dateOfBirth,
            statedBenefitId: member.statedBenefitId,
            statedBenefit: member.statedBenefit,
            joinDate: joinDate,
            PreviousInsurerJoinDate: member.PreviousInsurerJoinDate,
            PreviousInsurerCancellationDate:
              member.PreviousInsurerCancellationDate,
            PreviousInsurer: member.PreviousInsurer,
            PreviousInsurerPolicyNumber: member.PreviousInsurerPolicyNumber,
            PreviousInsurerCoverAmount: member.PreviousInsurerCoverAmount,
            addressLine1: member.addressLine1,
            addressLine2: member.addressLine2,
            city: member.city,
            province: member.province,
            postalCode: member.postalCode,
            tellNumber: member.tellNumber,
            cellNumber: member.cellNumber,
            emailAddress: member.emailAddress,
            preferredCommunicationTypeId: member.preferredCommunicationTypeId,
            gender: member.gender,
            isStudent: member.isStudent,
            isDisabled: member.isDisabled,
            supportDocument: member.supportDocument,
            notes: member.notes,
            createdBy: String(req?.auth?.payload?.user),
            updatedBy: String(req?.auth?.payload?.user),
            isBeneficiary:
              member.memberTypeId === 6
                ? true
                : member.memberTypeId === 1
                ? true
                : member.isBeneficiary,
          },
          { transaction: t, validate: true },
        );
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

    const policy = await onboardingPolicy.findOne({
      where: {
        id: createPolicy_id,
      },
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: update ? "Policy Updated" : "Policy created",
      data: {
        ...policy.dataValues,
      },
    });
  } catch (err: any) {
    console.log(`hitting this ${err}`);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Update policy
export const editPolicy = async (req: Request, res: Response) => {
  try {
    const {
      members,
      joinDate,
      productType,
      providerId,
      coverAmount,
      productOptionId,
      brokerageId,
      providerInceptionDate,
      status,
      statusNote,
      brokerageName,
      providerName,
      allowDuplicate,
      memberChanges,
    } = req.body;

    const { id } = req.params;

    // if productOptionId is missing
    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Error, product option id is missing",
      });
    }

    // get policy
    const currentPolicy = await onboardingPolicy.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
        },
      ],
    });

    // if policy is not found return error
    if (!currentPolicy) {
      return res.status(400).json({
        success: false,
        message: "Error, policy not found",
      });
    }

    // if joinDate is  missing
    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is missing",
      });
    }

    // calculate minimum join date, it is the 1st of the current month if  the createdAt date is before the 15th of the month else it is the 1st of the next month
    const createdAtDate = new Date(currentPolicy.createdAt);
    const currentDay = createdAtDate.getDate();
    const currentMonth = createdAtDate.getMonth();
    const currentYear = createdAtDate.getFullYear();
    let minJoinDate: Date = new Date(currentYear, currentMonth, 1);
    if (currentDay > 15) {
      minJoinDate = new Date(currentYear, currentMonth + 1, 1);
    }

    // check if joinDate is before the minimum join date
    if (new Date(joinDate) < minJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be before ${minJoinDate.toDateString()}`,
      });
    }

    // get maximum join date, it is 3 months from the current min join date
    const maxJoinDate: Date = new Date(minJoinDate);
    maxJoinDate.setMonth(maxJoinDate.getMonth() + 3);

    // check if joinDate is after the maximum join date
    if (new Date(joinDate) > maxJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be after ${maxJoinDate.toDateString()}`,
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
        member.memberTypeId === 1 || member.memberType === "Main Member",
    );
    if (!memberTypeId) {
      return res.status(400).json({
        success: false,
        message: "Error, no main member provided",
      });
    } else {
      // member.isVopdVerified = true then set mainMemberVOPDDone to true
      // console.log(`Member Type ID: ${JSON.stringify(memberTypeId)}`);
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
          "Duplicate",
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

    const validateMembers = await members.map((member: any) => {
      // reset exceptions array
      member["status"] = member?.status === "Deleted" ? member?.status : "New";
      member["exceptions"] = [];

      if (member.status === "Deleted") {
        return member;
      }

      if (
        member.preferredCommunicationTypeId &&
        member.preferredCommunicationTypeId !== "" &&
        !["1", "3"].includes(String(member.preferredCommunicationTypeId))
      ) {
        member["exceptions"].push({
          message: `Invalid communication method. Only Email and SMS are allowed.`,
          field: "preferredCommunicationTypeId",
        });
        memberErrors = true;
      }

      // check if firstName is provided
      if (!member.firstName) {
        member["exceptions"].push({
          message: `No first name provided`,
          field: "firstName",
        });
        memberErrors = true;
      }
      // check if firstName is empty
      else if (member.firstName.trim() === "") {
        member["exceptions"].push({
          message: `First name is empty`,
          field: "firstName",
        });
        memberErrors = true;
      }

      // check if surname is provided
      if (!member.surname) {
        member["exceptions"].push({
          message: `No surname provided`,
          field: "surname",
        });
        memberErrors = true;
      }
      // check if surname is empty
      else if (member.surname.trim() === "") {
        member["exceptions"].push({
          message: `No surname provided`,
          field: "surname",
        });
        memberErrors = true;
      }

      // check if ID number is provided
      if (!member.idNumber) {
        member["exceptions"].push({
          message: `No ID number provided`,
          field: "idNumber",
        });
        memberErrors = true;
      }

      // check if ID number is valid
      if (member.idTypeId === 1 && !SAIDValidator(member.idNumber)) {
        member["exceptions"].push({
          message: `Invalid ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      }

      // check if ID number is unique
      if (idNumberList.includes(member.idNumber)) {
        member["exceptions"].push({
          message: `Duplicate ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      } else if (member.idTypeId === 1) {
        idNumberList.push(member.idNumber);
      }

      if (member.cellNumber) {
        const validatedCell = contactNoValidator(member.cellNumber);
        if (!validatedCell) {
          member["exceptions"].push({
            message: `Invalid Contact Numbers`,
            field: "cellNumber",
          });
          memberErrors = true;
        } else {
          member.cellNumber = validatedCell;
        }
      }

      // check if VOPD response is provided if it is check if person is deceased

      if (member.isVopdVerified) {
        member.isDeceased = member?.vopdResponse?.dateOfDeath ? true : false;
        member.dateOfDeath = member?.vopdResponse?.dateOfDeath;
        member.dateVopdVerified = member?.vopdResponse?.updatedAt;

        if (member.isDeceased) {
          member["exceptions"].push({
            message: `Deceased person`,
            field: "isDeceased",
          });
          memberErrors = true;
        }
      }

      // check preferredCommunicationTypeId === 1 and emailAddress is null then exceptions
      if (member.preferredCommunicationTypeId === "1" && !member.emailAddress) {
        member["exceptions"].push({
          message: `Email address is required for preferred communication`,
          field: "emailAddress",
        });
        memberErrors = true;
      }

      if (member.preferredCommunicationTypeId === "3" && !member.cellNumber) {
        member["exceptions"].push({
          message: `Cell phone number is required for preferred communication`,
          field: "cellNumber",
        });
        memberErrors = true;
      }

      // check that if PreviousInsurer or PreviousInsurerPolicyNumber or PreviousInsurerJoinDate or PreviousInsurerCancellationDate is set, all must be set
      if (
        (member.PreviousInsurer ||
          member.PreviousInsurerPolicyNumber ||
          member.PreviousInsurerJoinDate ||
          member.PreviousInsurerCancellationDate) &&
        (!member.PreviousInsurer ||
          !member.PreviousInsurerPolicyNumber ||
          !member.PreviousInsurerJoinDate ||
          !member.PreviousInsurerCancellationDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer details incomplete`,
          field: null,
        });
        memberErrors = true;
      }

      // check that member.PreviousInsurerJoinDate is not after PreviousInsurerCancelDate if values are set
      if (
        member.PreviousInsurerJoinDate &&
        member.PreviousInsurerCancellationDate &&
        new Date(member.PreviousInsurerJoinDate) >=
          new Date(member.PreviousInsurerCancellationDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer join date cannot be on or after cancel date`,
          field: "member.PreviousInsurerJoinDate",
        });
        memberErrors = true;
      }

      // if previous insurer join date is set, check that previous insurer join date is not after join date
      if (
        member.PreviousInsurerJoinDate &&
        new Date(member.PreviousInsurerJoinDate) >= new Date(joinDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer join date cannot be on or after join date`,
          field: "member.PreviousInsurerJoinDate",
        });
        memberErrors = true;
      }

      // if previous insurer cancel date is set, check that previous insurer cancel date is not after join date
      if (
        member.PreviousInsurerCancellationDate &&
        new Date(member.PreviousInsurerCancellationDate) >= new Date(joinDate)
      ) {
        member["exceptions"].push({
          message: `Previous insurer cancel date cannot be on or after join date`,
          field: "member.PreviousInsurerCancellationDate",
        });
        memberErrors = true;
      }

      // check that member dob is valid
      if (isNaN(Date.parse(member.dateOfBirth))) {
        member["exceptions"].push({
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
        member["exceptions"].push({
          message: `Invalid age`,
          field: "dateOfBirth",
        });
        memberErrors = true;
      }

      // main member
      if (member.memberTypeId === 1) {
        mainMemberCount++;
        if (mainMemberCount === 1) {
          mainMemberAllocation = member;
        } else if (mainMemberCount > 1) {
          member["exceptions"].push({
            message: `Too many main members`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // spouse
      else if (member.memberTypeId === 2) {
        spouseCount++;
        if (spouseCount === 1) {
          spouseAllocation = member;
        } else if (spouseCount > 1) {
          member["exceptions"].push({
            message: `Too many spouses`,
            field: `memberTypeId`,
          });
          memberErrors = true;
        }
      }
      // children
      else if (member.memberTypeId === 3) {
        childrenCount++;
        if (childrenCount > 6) {
          member["exceptions"].push({
            message: `Too many children`,
            field: null,
          });
          memberErrors = true;
        }

        if (
          (member.isDisabled || member.isStudent) &&
          member.supportDocument === null
        ) {
          member["exceptions"].push({
            message: `No support document`,
            field: "supportDocument",
          });
          memberErrors = true;
        }

        // check if child is over 21 years old and not a student or disable
        if (memberAge > 21 && !member.isDisabled && !member.isStudent) {
          member["exceptions"].push({
            message: `Child is over 21 years old and not a student or disabled`,
            field: null,
          });
          memberErrors = true;
        }
      }
      // extended family
      else if (member.memberTypeId === 4) {
        extendedFamilyCount++;
      } else if (member.memberTypeId === 6) {
        beneficiaryCount++;
      } else {
        unknownCount++;
        // append to member.exceptions array for unknown roleplayerTypeId found
        member["exceptions"].push({
          message: `Unknown roleplayer type`,
          field: null,
        });
        memberErrors = true;
      }

      // check main member
      if (member.memberTypeId === 1) {
        // format tellNumber if specified
        member.tellNumber = member.tellNumber
          ? contactNoValidator(member.tellNumber)
          : null;
        // format cellNumber if specified
        if (member.cellNumber) {
          const validatedCell = contactNoValidator(member.cellNumber);
          if (!validatedCell) {
            member["exceptions"].push({
              message: `Invalid Contact Numbers`,
              field: "cellNumber",
            });
            memberErrors = true;
          } else {
            member.cellNumber = validatedCell;
          }
        }

        if (
          member.idTypeId === 2 &&
          member.idNumber &&
          member?.supportDocument?.length === 0
        ) {
          member["exceptions"].push({
            message: `No support document`,
            field: "supportDocument",
          });
          memberErrors = true;
        }

        // check if member has valid email if specified
        if (member.emailAddress && !emailValidator(member.emailAddress)) {
          member["exceptions"].push({
            message: `Invalid email`,
            field: "email",
          });
          memberErrors = true;
        }

        // check if member has at least 1 contact method = tellNumber, cellNumber, email
        if (!member.tellNumber && !member.cellNumber && !member.emailAddress) {
          member["exceptions"].push({
            message: `No contact method specified`,
            field: null,
          });
          memberErrors = true;
        }

        if (
          !member.preferredCommunicationTypeId ||
          member.preferredCommunicationTypeId === ""
        ) {
          member.preferredCommunicationTypeId = "3";
        }

        if (
          !["1", "3"].includes(String(member.preferredCommunicationTypeId))
        ) {
          member["exceptions"].push({
            message: `Invalid communication method. Only Email and SMS are allowed.`,
            field: "preferredCommunicationTypeId",
          });
          memberErrors = true;
        }

        if (
          member.preferredCommunicationTypeId === "1" &&
          !member.emailAddress
        ) {
          member["exceptions"].push({
            message: `Email address is required for preferred communication`,
            field: "emailAddress",
          });
          memberErrors = true;
        }

        if (
          member.preferredCommunicationTypeId === "3" &&
          !member.cellNumber
        ) {
          member["exceptions"].push({
            message: `Cell phone number is required for preferred communication`,
            field: "cellNumber",
          });
          memberErrors = true;
        }

        // check if member has preferredCommunicationTypeId specified
        if (!member.preferredCommunicationTypeId) {
          member["exceptions"].push({
            message: `No preferred communication type specified`,
            field: null,
          });
          memberErrors = true;
        }

        // check address details
        if (!member.addressLine1) {
          member["exceptions"].push({
            message: `No address line 1 specified`,
            field: "addressLine1",
          });
          memberErrors = true;
        }

        // postal code needed
        // if (!member.postalCode) {
        //   member["exceptions"].push({
        //     message: `No postal code specified`,
        //     field: "postalCode",
        //   });
        //   memberErrors = true;
        // }

        // province needed
        // if (!member.province) {
        //   member["exceptions"].push({
        //     message: `No province specified`,
        //     field: "province",
        //   });
        //   memberErrors = true;
        // }

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
          member["exceptions"].push({
            message: `Invalid province specified`,
            field: "province",
          });
          memberErrors = true;
        }
      }

      // if addressLine1 longer than 50 characters
      if (member.addressLine1 && member?.addressLine1?.length > 50) {
        member["exceptions"].push({
          message: `Address line 1 too long`,
          field: "addressLine1",
        });
        memberErrors = true;
      }

      // if addressLine2 longer than 50 characters
      if (member.addressLine2 && member?.addressLine2?.length > 50) {
        member["exceptions"].push({
          message: `Address line 2 too long`,
          field: "addressLine2",
        });
        memberErrors = true;
      }

      // if city longer than 50 characters
      if (member.city && member?.city?.length > 50) {
        member["exceptions"].push({
          message: `City too long`,
          field: "city",
        });
        memberErrors = true;
      }

      // if member.exceptions is not empty set status to error
      if (member?.exceptions?.length > 0) {
        member["status"] = "Error";
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

    const policyStatusNote: String =
      policyStatus === "Error" ? "Issue on members" : "Checking Policy";

    // VALIDATION END

    if (productType !== "Scheme") {
      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "Provider id is missing",
        });
      }

      // BrokerageRepresentativeMapId = providerId;
    }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let PolicyCreated: any = {};
    try {
      logger.debug("Policy Update");
      PolicyCreated = await onboardingPolicy.update(
        {
          providerId: providerId,
          ProductOptionId: productOptionId,
          brokerageId: brokerageId,
          providerInceptionDate: providerInceptionDate,
          joinDate: joinDate,
          coverAmount: coverAmount,
          status: policyStatus,
          statusNote: policyStatusNote,
          updatedBy: String(req?.auth?.payload?.user),
          brokerageName: brokerageName,
          providerName: providerName,
          allowDuplicate: allowDuplicate,
        },
        {
          where: {
            id: id,
          },
          returning: true,
          transaction: t,
          validate: true,
        },
      );

      function getChangedFields(
        oldObj: any,
        newObj: any,
        fieldsToCompare: any,
      ) {
        const changes = {} as any;

        fieldsToCompare.forEach((field: any) => {
          let oldValue = oldObj[field];
          let newValue = newObj[field];

          // If these are Dates, convert to ISO for reliable comparison
          if (oldValue instanceof Date) oldValue = oldValue.toISOString();
          if (newValue instanceof Date) newValue = newValue.toISOString();

          // Handle possible undefined/null
          if (oldValue === undefined) oldValue = null;
          if (newValue === undefined) newValue = null;

          if (oldValue !== newValue) {
            changes[field] = {
              from: oldValue,
              to: newValue,
            };
          }
        });

        return changes;
      }

      const fieldsToCompare = [
        "joinDate",
        "coverAmount",
        "approverId",
        "updatedBy",
        "selectedCategory",
        "status",
        "statusNote",
        "allowDuplicate",
        "productType",
      ];

      PolicyCreated[1][0].dataValues.joinDate =
        PolicyCreated[1][0].dataValues.PolicyInceptionDate;

      // 4️⃣ Run the comparison function
      const changedFields = getChangedFields(
        currentPolicy.dataValues,
        PolicyCreated[1][0].dataValues,
        fieldsToCompare,
      );

      // THIS THIS

      // if policy is not updated return error
      if (PolicyCreated[0] === 0) {
        return res.status(400).json({
          success: false,
          message: "Error, policy not updated",
        });
      }

      // if status is Processing
      if (policyStatus === "Processing") {
        // delete all entries for policies in PolicyCheck
        await PolicyCheck.destroy({
          where: {
            policyId: id,
          },
          transaction: t,
        });

        // update exceptions to [] where alsoMember = true
        await onboardingData.update(
          {
            exceptions: [],
            statedBenefitId: null,
            statedBenefit: null,
          },
          {
            where: {
              policyId: id,
              alsoMember: true,
            },
            transaction: t,
            validate: true,
          },
        );
      }

      // create members onboardingData
      const promises: any = await validateMembers.map(async (member: any) => {
        if (member.id) {
          // console.log(
          //   `Updating id: ${
          //     member.id
          //   } , policyId: ${id} member ${JSON.stringify(member)}  `,
          // );
          await onboardingData.update(
            {
              idValid: SAIDValidator(member.idNumber),
              isVopdVerified:
                policyStatus === "Processing" ? false : member.isVopdVerified,
              isDeceased: member.isDeceased,
              dateOfDeath: member.dateOfDeath,
              dateVopdVerified:
                policyStatus === "Processing" ? null : member.dateVopdVerified,
              vopdResponse:
                policyStatus === "Processing"
                  ? null
                  : member.isVopdVerified
                  ? member.vopdResponse
                  : null,
              status: member.status,
              exceptions: member.exceptions,
              client_type: returnMemberType(member.memberTypeId),
              memberTypeId: member.memberTypeId,
              firstName: member.firstName,
              surname: member.surname,
              idTypeId: member.idTypeId,
              idNumber: member.idNumber,
              dateOfBirth: member.dateOfBirth,
              statedBenefitId:
                policyStatus === "Processing" ? null : member.statedBenefitId,
              statedBenefit:
                policyStatus === "Processing" ? null : member.statedBenefit,
              joinDate: joinDate,
              PreviousInsurerJoinDate: member.PreviousInsurerJoinDate,
              PreviousInsurerCancellationDate:
                member.PreviousInsurerCancellationDate,
              PreviousInsurer: member.PreviousInsurer,
              PreviousInsurerPolicyNumber: member.PreviousInsurerPolicyNumber,
              PreviousInsurerCoverAmount: member.PreviousInsurerCoverAmount,
              addressLine1: member.addressLine1,
              addressLine2: member.addressLine2,
              city: member.city,
              province: member.province,
              postalCode: member.postalCode,
              tellNumber: member.tellNumber,
              cellNumber: member.cellNumber,
              emailAddress: member.emailAddress,
              preferredCommunicationTypeId: member.preferredCommunicationTypeId,
              gender: member.gender,
              isStudent: member.isStudent,
              isDisabled: member.isDisabled,
              supportDocument: member.supportDocument,
              notes: member.notes,
              updatedBy: String(req?.auth?.payload?.user),
              isBeneficiary:
                member.memberTypeId === 6
                  ? true
                  : member.memberTypeId === 1
                  ? true
                  : member.isBeneficiary,
              deletedAt: member.deletedAt,
              allowDuplicate: allowDuplicate,
            },
            {
              transaction: t,
              validate: true,
              where: { id: member.id, policyId: id },
              paranoid: false, // need this to be able to update deleted records
            },
          );
        } else {
          await onboardingData.create(
            {
              policyId: id,
              idValid: SAIDValidator(member.idNumber),
              isVopdVerified: member.isVopdVerified,
              isDeceased: member.isDeceased,
              dateOfDeath: member.dateOfDeath,
              dateVopdVerified: member.dateVopdVerified,
              vopdResponse: member.isVopdVerified ? member.vopdResponse : null,
              status: member.status,
              exceptions: member.exceptions,
              client_type: returnMemberType(member.memberTypeId),
              memberTypeId: member.memberTypeId,
              firstName: member.firstName,
              surname: member.surname,
              idTypeId: member.idTypeId,
              idNumber: member.idNumber,
              dateOfBirth: member.dateOfBirth,
              statedBenefitId:
                policyStatus === "Processing" ? null : member.statedBenefitId,
              statedBenefit:
                policyStatus === "Processing" ? null : member.statedBenefit,
              joinDate: joinDate,
              PreviousInsurerJoinDate: member.PreviousInsurerJoinDate,
              PreviousInsurerCancellationDate:
                member.PreviousInsurerCancellationDate,
              PreviousInsurer: member.PreviousInsurer,
              PreviousInsurerPolicyNumber: member.PreviousInsurerPolicyNumber,
              PreviousInsurerCoverAmount: member.PreviousInsurerCoverAmount,
              addressLine1: member.addressLine1,
              addressLine2: member.addressLine2,
              city: member.city,
              province: member.province,
              postalCode: member.postalCode,
              tellNumber: member.tellNumber,
              cellNumber: member.cellNumber,
              emailAddress: member.emailAddress,
              preferredCommunicationTypeId: member.preferredCommunicationTypeId,
              gender: member.gender,
              isStudent: member.isStudent,
              isDisabled: member.isDisabled,
              supportDocument: member.supportDocument,
              notes: member.notes,
              createdBy: String(req?.auth?.payload?.user),
              updatedBy: String(req?.auth?.payload?.user),
              isBeneficiary:
                member.memberTypeId === 6
                  ? true
                  : member.memberTypeId === 1
                  ? true
                  : member.isBeneficiary,
              deletedAt: member.deletedAt,
            },
            { transaction: t, validate: true },
          );
        }
      });

      const memberChangesLength = memberChanges
        ? JSON.stringify(memberChanges).length
        : 0;
      const changedFieldsLength = changedFields
        ? JSON.stringify(changedFields).length
        : 0;

      if (
        ((memberChanges && memberChanges.length > 0) || changedFields) &&
        memberChangesLength <= 4000 &&
        changedFieldsLength <= 4000
      ) {
        await onboarding_logs.create(
          {
            policy_id: id,
            member_changes: memberChanges,
            policy_changes: changedFields,
            user: String(req?.auth?.payload?.user),
          },
          { transaction: t },
        );
      }

      // for unhandlerejection error, don't know why yet
      await Promise.all(promises).then(async () => {
        await t.commit();
      });
    } catch (err: any) {
      console.log(`hitting this ${err}`);
      await t.rollback();
      return res.status(400).json(sequelizeErrorHandler(err));
    }

    const policy = await onboardingPolicy.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
          tableHint: TableHints.NOLOCK,
          paranoid: false,
        },
      ],
      tableHint: TableHints.NOLOCK,
      paranoid: false,
    });

    return res.status(201).json({
      success: true,
      message: update ? "Policy Updated" : "Policy created",
      data: {
        ...policy.dataValues,
      },
    });
  } catch (err: any) {
    console.log(`hitting this ${err}`);

    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Update policy
export const editPolicyNoValidation = async (req: Request, res: Response) => {
  try {
    const {
      joinDate,
      members,
      productType,
      providerId,
      coverAmount,
      productOptionId,
      brokerageId,
      providerInceptionDate,
      status,
      statusNote,
      brokerageName,
      providerName,
      allowDuplicate,
    } = req.body;

    const { id } = req.params;

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

    // get policy
    const currentPolicy = await onboardingPolicy.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
        },
      ],
    });

    // if policy is not found return error
    if (!currentPolicy) {
      return res.status(400).json({
        success: false,
        message: "Error, policy not found",
      });
    }

    // if joinDate is  missing
    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is missing",
      });
    }

    // calculate minimum join date, it is the 1st of the current month if  the createdAt date is before the 15th of the month else it is the 1st of the next month
    const createdAtDate = new Date(currentPolicy.createdAt);
    const currentDay = createdAtDate.getDate();
    const currentMonth = createdAtDate.getMonth();
    const currentYear = createdAtDate.getFullYear();
    let minJoinDate: Date = new Date(currentYear, currentMonth, 1);
    if (currentDay > 15) {
      minJoinDate = new Date(currentYear, currentMonth + 1, 1);
    }

    // check if joinDate is before the minimum join date
    if (new Date(joinDate) < minJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be before ${minJoinDate.toDateString()}`,
      });
    }

    // get maximum join date, it is 3 months from the current min join date
    const maxJoinDate: Date = new Date(minJoinDate);
    maxJoinDate.setMonth(maxJoinDate.getMonth() + 3);

    // check if joinDate is after the maximum join date
    if (new Date(joinDate) > maxJoinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date cannot be after ${maxJoinDate.toDateString()}`,
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

    if (!members || members?.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, members is missing",
      });
    }

    // confirm that MemberTypeId = 1 or memberType = Main Member exists in array of members
    let mainMemberVOPDDone: boolean = false;
    const memberTypeId = members.find(
      (member: any) =>
        member.memberTypeId === 1 || member.memberType === "Main Member",
    );
    if (!memberTypeId) {
      return res.status(400).json({
        success: false,
        message: "Error, no main member provided",
      });
    } else {
      // member.isVopdVerified = true then set mainMemberVOPDDone to true
      // console.log(`Member Type ID: ${JSON.stringify(memberTypeId)}`);
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
          "Duplicate",
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

    if (productType !== "Scheme") {
      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "Provider id is missing",
        });
      }

      // BrokerageRepresentativeMapId = providerId;
    }

    let update: boolean = false;
    const t = await sequelize.transaction();
    let PolicyCreated: any = {};
    try {
      logger.debug("Policy Update");
      PolicyCreated = await onboardingPolicy.update(
        {
          providerId: providerId,
          ProductOptionId: productOptionId,
          brokerageId: brokerageId,
          providerInceptionDate: providerInceptionDate,
          joinDate: joinDate,
          coverAmount: coverAmount,
          status: status,
          statusNote: statusNote || "Saved",
          updatedBy: String(req?.auth?.payload?.user),
          brokerageName: brokerageName,
          providerName: providerName,
          allowDuplicate: allowDuplicate,
        },
        {
          where: {
            id: id,
          },
          returning: true,
          transaction: t,
          validate: true,
        },
      );

      // if policy is not updated return error
      if (PolicyCreated[0] === 0) {
        return res.status(400).json({
          success: false,
          message: "Error, policy not updated",
        });
      }

      // if status is Processing delete all entries for policies in PolicyCheck
      if (status === "Processing") {
        await PolicyCheck.destroy({
          where: {
            policyId: id,
          },
          transaction: t,
        });
      }

      // create members onboardingData
      const promises: any = await members.map(async (member: any) => {
        if (member.id) {
          // console.log(
          //   `Updating id: ${
          //     member.id
          //   } , policyId: ${id} member ${JSON.stringify(member)}  `,
          // );
          await onboardingData.update(
            {
              idValid: SAIDValidator(member.idNumber),
              isVopdVerified: member.isVopdVerified,
              isDeceased: member.isDeceased,
              dateOfDeath: member.dateOfDeath,
              dateVopdVerified: member.dateVopdVerified,
              vopdResponse: member.isVopdVerified ? member.vopdResponse : null,
              status: member.status,
              exceptions: member.exceptions,
              client_type: returnMemberType(member.memberTypeId),
              memberTypeId: member.memberTypeId,
              firstName: member.firstName,
              surname: member.surname,
              idTypeId: member.idTypeId,
              idNumber: member.idNumber,
              dateOfBirth: member.dateOfBirth,
              statedBenefitId: member.statedBenefitId,
              statedBenefit: member.statedBenefit,
              joinDate: joinDate,
              PreviousInsurerJoinDate: member.PreviousInsurerJoinDate,
              PreviousInsurerCancellationDate:
                member.PreviousInsurerCancellationDate,
              PreviousInsurer: member.PreviousInsurer,
              PreviousInsurerPolicyNumber: member.PreviousInsurerPolicyNumber,
              PreviousInsurerCoverAmount: member.PreviousInsurerCoverAmount,
              addressLine1: member.addressLine1,
              addressLine2: member.addressLine2,
              city: member.city,
              province: member.province,
              postalCode: member.postalCode,
              tellNumber: member.tellNumber,
              cellNumber: member.cellNumber,
              emailAddress: member.emailAddress,
              preferredCommunicationTypeId: member.preferredCommunicationTypeId,
              gender: member.gender,
              isStudent: member.isStudent,
              isDisabled: member.isDisabled,
              supportDocument: member.supportDocument,
              notes: member.notes,
              updatedBy: String(req?.auth?.payload?.user),
              isBeneficiary:
                member.memberTypeId === 6
                  ? true
                  : member.memberTypeId === 1
                  ? true
                  : member.isBeneficiary,
              deletedAt: member.deletedAt,
            },
            {
              transaction: t,
              validate: true,
              where: { id: member.id, policyId: id },
              paranoid: false, // need this to be able to update deleted records
            },
          );
        } else {
          await onboardingData.create(
            {
              policyId: id,
              idValid: SAIDValidator(member.idNumber),
              isVopdVerified: member.isVopdVerified,
              isDeceased: member.isDeceased,
              dateOfDeath: member.dateOfDeath,
              dateVopdVerified: member.dateVopdVerified,
              vopdResponse: member.isVopdVerified ? member.vopdResponse : null,
              status: member.status,
              exceptions: member.exceptions,
              client_type: returnMemberType(member.memberTypeId),
              memberTypeId: member.memberTypeId,
              firstName: member.firstName,
              surname: member.surname,
              idTypeId: member.idTypeId,
              idNumber: member.idNumber,
              dateOfBirth: member.dateOfBirth,
              statedBenefitId: member.statedBenefitId,
              statedBenefit: member.statedBenefit,
              joinDate: joinDate,
              PreviousInsurerJoinDate: member.PreviousInsurerJoinDate,
              PreviousInsurerCancellationDate:
                member.PreviousInsurerCancellationDate,
              PreviousInsurer: member.PreviousInsurer,
              PreviousInsurerPolicyNumber: member.PreviousInsurerPolicyNumber,
              PreviousInsurerCoverAmount: member.PreviousInsurerCoverAmount,
              addressLine1: member.addressLine1,
              addressLine2: member.addressLine2,
              city: member.city,
              province: member.province,
              postalCode: member.postalCode,
              tellNumber: member.tellNumber,
              cellNumber: member.cellNumber,
              emailAddress: member.emailAddress,
              preferredCommunicationTypeId: member.preferredCommunicationTypeId,
              gender: member.gender,
              isStudent: member.isStudent,
              isDisabled: member.isDisabled,
              supportDocument: member.supportDocument,
              notes: member.notes,
              updatedBy: String(req?.auth?.payload?.user),
              isBeneficiary:
                member.memberTypeId === 6
                  ? true
                  : member.memberTypeId === 1
                  ? true
                  : member.isBeneficiary,
              createdBy: String(req?.auth?.payload?.user),
              deletedAt: member.deletedAt,
            },
            { transaction: t, validate: true },
          );
        }
      });

      // for unhandlerejection error, don't know why yet
      await Promise.all(promises).then(async () => {
        await t.commit();
      });
    } catch (err: any) {
      console.log(`hitting this ${err}`);
      await t.rollback();
      return res.status(400).json(sequelizeErrorHandler(err));
    }

    const policy = await onboardingPolicy.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: onboardingData,
          as: "members",
          required: true,
          tableHint: TableHints.NOLOCK,
          paranoid: false,
        },
      ],
      tableHint: TableHints.NOLOCK,
      paranoid: false,
    });

    return res.status(201).json({
      success: true,
      message: update ? "Policy Updated" : "Policy created",
      data: {
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

    // check if joinDate is the 1st of the current month or in the future
    if (
      joinDate &&
      new Date(joinDate) <
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Error, join date is in the past",
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

    if (!policyIds || policyIds?.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, policy ids are missing",
      });
    }

    let orgStatus: string = "Ready";
    if (status === "Approved") {
      orgStatus = "Submitted";
    }

    const policies = await onboardingPolicy.update(
      {
        status: status,
        updatedBy: String(req?.auth?.payload?.user),
        deletedAt: status === "Removed" ? new Date() : null,
      },
      {
        where: {
          id: policyIds,
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
