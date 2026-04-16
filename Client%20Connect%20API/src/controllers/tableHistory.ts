// get request to get tableHistory
import { Request, Response } from "express";
const {
  tableHistory,
  Member,
  PolicyMember,
  Policy,
  sequelize,
} = require("../models");
import { logger } from "../middleware/logger";
const { QueryTypes } = require("sequelize");

export const getTableHistory = async (req: Request, res: Response) => {
  try {
    const { tableId } = req.params;

    if (!tableId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a policy id",
      });
    }

    const policyHistorystore = await tableHistory.findAll({
      where: {
        schemaName: "onboarding",
        tableName: "PolicyData",
        tableId: tableId,
      },
      attributes: [
        "id",
        "changedValue",
        "changeType",
        "updatedBy",
        "createdAt",
      ],
    });

    // raw sql query to get the members of the policy
    // const combMembers = await sequelize.query(
    //   `select distinct a.FirstName as firstName, a.Surname as surname, a.IdNumber as idNumber, c.changeType, c.changedValue, c.updatedBy, c.createdAt from onboarding_portal.onboarding.[Member] as a inner join onboarding_portal.onboarding.PolicyMember as b on a.MemberId = b.InsuredMemberId and b.policyDataId =  ${tableId} inner join onboarding_portal.dbo.tableHistory as c on a.MemberId = c.tableId and c.schemaName = 'onboarding' and c.tableName = 'Member' union select distinct a.FirstName as firstName, a.Surname as surname, a.IdNumber as idNumber, c.changeType, c.changedValue, c.updatedBy, c.createdAt from onboarding_portal.onboarding.[Member] as a inner join onboarding_portal.onboarding.PolicyMember as b on a.MemberId = b.InsuredMemberId and b.policyDataId =  ${tableId} inner join onboarding_portal.dbo.tableHistory as c on b.PolicyMemberId  = c.tableId and c.schemaName = 'onboarding' and c.tableName = 'PolicyMember';`,
    //   {
    //     type: QueryTypes.SELECT,
    //   },
    // );

    const combMembers = await sequelize.query(
      `select distinct a."FirstName" as "firstName", a."Surname" as surname, a."IdNumber" as idNumber, c."changeType", c."changedValue", c."updatedBy", c."createdAt" 
      from "onboarding"."Member" as a 
      inner join "onboarding"."PolicyMember" as b on a."MemberId" = b."InsuredMemberId" and b."PolicyDataId" = ${tableId}
      inner join "public"."tableHistory" as c on a."MemberId" = c."tableId" and c."schemaName" = 'onboarding' and c."tableName" = 'Member' 
      union 
      select distinct a."FirstName" as "firstName", a."Surname" as surname, a."IdNumber" as idNumber, c."changeType", c."changedValue", c."updatedBy", c."createdAt" 
      from "onboarding"."Member" as a 
      inner join "onboarding"."PolicyMember" as b on a."MemberId" = b."InsuredMemberId" and b."PolicyDataId" = ${tableId}
      inner join "public"."tableHistory" as c on b."PolicyMemberId" = c."tableId" and c."schemaName" = 'onboarding' and c."tableName" = 'PolicyMember'`,
      {
        replacements: { tableId },
        type: QueryTypes.SELECT,
      },
    );
    console.log("combMembers", combMembers);

    // for each combination of idNumber, firstname and surname add the changes to the changes array
    const membersArray: any = [];
    combMembers.forEach((member: any) => {
      const memberIndex = membersArray.findIndex(
        (item: any) =>
          item.idNumber === member.idNumber &&
          item.firstName === member.firstName &&
          item.surname === member.surname,
      );
      if (memberIndex === -1) {
        membersArray.push({
          idNumber: member.idNumber,
          firstName: member.firstName,
          surname: member.surname,
          changes: [
            {
              changeType: member.changeType,
              changedValue: JSON.parse(member.changedValue),
              updatedBy: member.updatedBy,
              createdAt: member.createdAt,
            },
          ],
        });
      } else {
        membersArray[memberIndex].changes.push({
          changeType: member.changeType,
          changedValue: JSON.parse(member.changedValue),
          updatedBy: member.updatedBy,
          createdAt: member.createdAt,
        });
      }
    });

    // check if policyHistorystore is empty object
    if (
      Object.keys(policyHistorystore).length === 0 &&
      Object.keys(membersArray).length === 0
    ) {
      return res.status(200).json({
        success: false,
        message: "No history found for this policy",
      });
    }

    const tableHistorystore: object = {
      policyChanges: policyHistorystore,
      memberChanges: membersArray,
    };

    return res.status(200).json({
      success: true,
      data: tableHistorystore,
    });
  } catch (err: any) {
    logger.debug(err.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
