import e, { Request, Response } from "express";
import { RecommenderEnums } from "../enums/recommenderEnums";
import {
  returnRoleplayerType,
  returnMemberType,
  getMainMemberCover,
  getDependantCover,
} from "../utils/benefit_recommender";
import { getAgeByPolicyJoinDate } from "../utils/dates";
import { RolePlayerTypeEnums } from "../enums/rolePlayerTypeEnums";
const {
  BenefitRule,
  ProductOptionBenefit,
  ProductType,
  sequelize,
  Sequelize,
} = require("../models");

import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import {
  contactNoValidator,
  emailValidator,
  SAIDValidator,
} from "../utils/validator";

import validatePolicyBenefit from "../rules-engine/benefit-rules";
import { policyParser } from "../rules-engine/helpers/benefitsByCoverMemberType";

import {
  // mainMemberAllocationRecommender,
  benefitValidation,
} from "../recommender-system/benefitAllocationRecommender";
import mainMemberCoverAmountRule from "../rules-engine/benefit-allocation-rules/mainMemberCoverAmountRule";
import { getBenefitByBenefitId } from "../handlers/rulesHandler";

export const validateMemberBenfitsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { benefitId } = req.params;

    const findBenefit = await BenefitRule.findOne(
      { where: { benefitId } },
      { returning: true },
    );

    if (!findBenefit) {
      return res.status(400).json({
        success: false,
        message: "Benefit not found",
      });
    } else {
      const ruleParsed = policyParser(findBenefit, req.body);
      const results = await validatePolicyBenefit(
        findBenefit.dataValues,
        ruleParsed,
      );

      return res.status(200).json({
        success: true,
        message: `Benefit validation results with benefit id ${benefitId}`,
        data: results,
      });
    }
  } catch (err: any) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: sequelizeErrorHandler(err),
      err,
    });
  }
};

export const allocateMemberBenefitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      joinDate,
      coverAmount,
      productOptionId,
      members,
      productType,
      providerInceptionDate,
    } = req.body;

    // check for joinDate
    if (!joinDate) {
      return res.status(400).json({
        success: false,
        message: `Join date not specified`,
      });
    }

    // TODO Valid joinDate

    // check for coverAmount
    if (!coverAmount) {
      return res.status(400).json({
        success: false,
        message: `Cover amount not specified`,
      });
    }

    // check for coverAmount is number
    if (isNaN(Number(coverAmount))) {
      return res.status(400).json({
        success: false,
        message: `Cover amount must be a number`,
      });
    }

    // check for productOptionId
    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: `Product option id not specified`,
      });
    }

    // check for members array of objects
    if (!members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, members is missing",
      });
    }

    // check for productTypeId
    if (!productType) {
      return res.status(400).json({
        success: false,
        message: `Product type not specified`,
      });
    }

    // check if productTypeId is valid
    // const productType = await ProductType.findOne({
    //   where: {
    //     id: productTypeId,
    //   },
    //   raw: true,
    // });

    // if (!productType) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid product type`,
    //   });
    // }

    if (productType === "Scheme" && !providerInceptionDate) {
      return res.status(400).json({
        success: false,
        message: `Provider inception date not specified`,
      });
    }
    // console.log(productType);
    // check if validCoverAmount for productOptionId
    const benefitAmount = await BenefitRule.findAll({
      where: {
        benefitAmount: Number(coverAmount),
      },
      raw: true,
      attributes: [
        [
          Sequelize.fn(
            "DISTINCT",
            Sequelize.col("ProductOptionBenefits.productOptionId"),
          ),
          "productOptionId",
        ],
        "benefitAmount",
      ],
      distinct: "ProductOptionBenefits.productOptionId",
      order: [["productOptionId", "ASC"]],
      include: [
        {
          model: ProductOptionBenefit,
          required: true,
          attributes: ["productOptionId"],
          where: {
            productOptionId: productOptionId,
          },
        },
      ],
    });

    if (benefitAmount.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid cover amount`,
      });
    }

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

    console.log(members);

    const validateMembers = await members.map((member: any) => {
      // if member.PolicyMember.status === "isDeleted" then skip
      if (member.PolicyMember.status === "Deleted") {
        member.PolicyMember.CoverAmount = 0;
        member.PolicyMember.benefitRate = 0;
        member.PolicyMember.exceptions = [];
        member.PolicyMember.Premium = 0;
        member.PolicyMember.statedBenefitId = null;
        member.PolicyMember.statedBenefit = null;
        return member;
      }

      member.PolicyMember["roleplayerTypeId"] = returnRoleplayerType(
        member.PolicyMember.memberTypeId,
      );

      member.PolicyMember["memberType"] = returnMemberType(
        member.PolicyMember.memberTypeId,
      );

      // if exception array does not exist, create it
      // if (!member.PolicyMember["exceptions"]) {
      member.PolicyMember["exceptions"] = [];
      // }

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
      if (idNumberList.includes(member.idNumber)) {
        member.PolicyMember["exceptions"].push({
          message: `Duplicate ID number`,
          field: "idNumber",
        });
        memberErrors = true;
      } else {
        idNumberList.push(member.idNumber);
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

      // check main member or spouse
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

    let reqBody = req.body;

    // if memberErrors, return error message with req.body.members replaced by updatedMembers
    if (memberErrors) {
      // let reqBody = req.body and replace members with updatedMembers
      reqBody.members = validateMembers;
      reqBody.status = "Error";
      return res.status(200).json({
        success: false,
        message: `Invalid member details`,
        data: reqBody,
      });
    }

    // console.log(productType);

    // allocate main member benefit
    const mainMemberCover = await getMainMemberCover(
      productType,
      productOptionId,
      spouseCount,
      childrenCount,
      extendedFamilyCount,
      coverAmount,
      mainMemberAllocation.age,
      providerInceptionDate,
    );

    if (!mainMemberCover.success) {
      return res.status(400).json({
        success: false,
        message: `Main member cover amount not allocated`,
      });
    }

    // console.log(mainMemberCover);

    const mainMemberBenefitId: number = mainMemberCover.data[0].benefitId;
    const mainMemberBenefit: string = mainMemberCover.data[0].benefit;
    let memberType: string = "";
    let subMemberCover: any = null;
    let other: number = mainMemberCover.data[0].familyMembers;
    let parent: number = mainMemberCover.data[0].familyMembersOver64;

    const allocatedMembers = await Promise.all(
      validateMembers.map(async (member: any) => {
        // if member.PolicyMember.status === "isDeleted" then skip
        if (member.PolicyMember.status === "Deleted") {
          member.PolicyMember.CoverAmount = 0;
          member.PolicyMember.benefitRate = 0;
          member.PolicyMember.exceptions = [];
          member.PolicyMember.Premium = 0;
          member.PolicyMember.statedBenefitId = null;
          member.PolicyMember.statedBenefit = null;

          return member;
        }

        if (member.PolicyMember.memberTypeId === 6) {
          member.PolicyMember.statedBenefitId = null;
          member.PolicyMember.statedBenefit = null;
          member.PolicyMember.benefit = null;
          return member;
        }

        subMemberCover = null;
        memberType = member.PolicyMember.memberType;
        if (
          member.PolicyMember.roleplayerTypeId ===
          RolePlayerTypeEnums.MAIN_MEMBER_SELF
        ) {
          member.PolicyMember.statedBenefitId = mainMemberBenefitId;
          member.PolicyMember.statedBenefit = mainMemberBenefit;
        }

        // child
        else if (
          // check if child meets student age criteria
          member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.CHILD &&
          member.isStudent &&
          (member.age < mainMemberCover.data[0].studentChildMinAge ||
            member.age > mainMemberCover.data[0].studentChildMaxAge)
        ) {
          member.PolicyMember["exceptions"].push({
            message: `Invalid student age`,
            field: "dateOfBirth",
          });
          memberErrors = true;
        } else if (
          member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.CHILD &&
          member.isDisabled &&
          member.age < mainMemberCover.data[0].disabledChildMinAge
        ) {
          // check if child meets disabled age criteria
          member.PolicyMember["exceptions"].push({
            message: `Invalid disabled age`,
            field: "dateOfBirth",
          });
          memberErrors = true;
        } else if (
          member.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.CHILD &&
          member.age > mainMemberCover.data[0].childMaxAge &&
          !member.isStudent &&
          !member.isDisabled
        ) {
          // check if child meets child age criteria
          member.PolicyMember["exceptions"].push({
            message: `Invalid child age`,
            field: "dateOfBirth",
          });
          memberErrors = true;
        } else {
          if (
            member.PolicyMember.roleplayerTypeId ===
              RolePlayerTypeEnums.CHILD &&
            member.isStudent
          ) {
            subMemberCover = "Student";
          }
          if (
            member.PolicyMember.roleplayerTypeId ===
              RolePlayerTypeEnums.CHILD &&
            member.isDisabled
          ) {
            subMemberCover = "Disabled";
          }
          // console.log(`other: ${other} parent: ${parent}`);

          // other or parent
          if (
            member.PolicyMember.roleplayerTypeId ===
              RolePlayerTypeEnums.EXTENDED &&
            other > 0 &&
            member.age >= mainMemberCover.data[0].familyMemberMinAge &&
            member.age <= mainMemberCover.data[0].familyMemberMaxAge
          ) {
            if (parent > 0 && member.age >= 65 && member.age <= 84) {
              other = other - 1;
              parent = parent - 1;
              subMemberCover = "Parent";
            } else if (member.age < 65) {
              subMemberCover = "Other";
              other = other - 1;
            }
          }
          // console.log(subMemberCover);
          // allocate dependant benefit

          const dependantBenefit = await getDependantCover(
            mainMemberBenefitId,
            member.age,
            memberType,
            subMemberCover,
          );

          if (!dependantBenefit.success) {
            member.PolicyMember.exceptions.push({
              message: `Benefit not allocated`,
              field: null,
            });
          } else {
            // console.log(dependantBenefit);

            member.PolicyMember.statedBenefitId = dependantBenefit.data[0].id;
            member.PolicyMember.statedBenefit =
              dependantBenefit.data[0].benefit;
          }
        }

        return member;
      }),
    );
    reqBody.members = allocatedMembers;

    // if memberErrors, return error message with req.body.members replaced by updatedMembers
    if (memberErrors) {
      // let reqBody = req.body and replace members with updatedMembers

      return res.status(400).json({
        success: false,
        message: `Invalid member details`,
        data: reqBody,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Benefits allocated", data: reqBody });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};
