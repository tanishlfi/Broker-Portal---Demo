import { TableHints } from "sequelize";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
const { Op, Sequelize, QueryTypes } = require("sequelize");
const {
  productOption,
  benefit,
  ProductOptionBenefit,
  BenefitRule,
  sequelize,
  BenefitConfiguration,
} = require("../models");
import { Request, Response } from "express";
import cache from "../utils/cache";
import {
  SAIDValidator,
  contactNoValidator,
  emailValidator,
} from "../utils/validator";
import { getAgeByPolicyJoinDate } from "../utils/dates";
import {
  getMainMemberCover,
  getDependentCover,
  getExtendedCover,
} from "../utils/benefitCalculator";

export const createBenefitConfiguration = async (
  req: Request,
  res: Response,
) => {
  try {
    const payload = req.body;

    const config = await BenefitConfiguration.create({
      ...payload,
      addedDependentBenefits: payload.addedDependentBenefits
        ? JSON.stringify(payload.addedDependentBenefits)
        : "[]",
    });

    return res.status(201).json({
      message: "Benefit configuration saved successfully",
      config,
    });
  } catch (err) {
    console.error("Error saving benefit configuration:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getBenefitConfigurations = async (req: Request, res: Response) => {
  try {
    // Optionally: filter by query params, e.g., productOptionId if needed
    // For now, get all benefit configurations

    const configs = await BenefitConfiguration.findAll();

    return res.status(200).json({
      benefitConfiguration: configs,
    });
  } catch (error) {
    console.error("Error fetching benefit configurations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// controller to get benefit amount based on product option id
export const getBenefitAmountByProductOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // get product option id from params
    const { productOptionId } = req.params;

    // if product option id is not provided then return error
    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product option id is required",
      });
    }

    const cachedData = cache.get(productOptionId);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: "Found the following cover amounts",
        data: cachedData,
      });
    }

    const coverAmounts = await benefit.findAll({
      include: [
        {
          model: productOption,
          where: {
            productOptionId: productOptionId,
          },
          attributes: [],
          tableHint: TableHints.NOLOCK,
        },
      ],
      where: {
        coverMemberTypeId: 1,
      },
      raw: true,
      tableHint: TableHints.NOLOCK,
      attributes: [
        [
          Sequelize.fn("DISTINCT", Sequelize.col("benefitAmount")),
          "benefitAmount",
        ],
      ],
      order: [["benefitAmount", "ASC"]],
    });

    // if length of benefits is 0 then return no benefits found
    if (coverAmounts.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No benefits amounts found",
      });
    }

    // create an array of unique benefit amounts
    const benefitArray = coverAmounts.map((benefit: any) => {
      return benefit.benefitAmount;
    });

    const expiryTime = 300;

    cache.set(productOptionId, benefitArray, expiryTime);

    return res.status(200).json({
      success: true,
      message: "Found the following cover amounts",
      data: benefitArray,
    });
  } catch (err) {
    return err;
  }
};

export const getBenefitsByProductionOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { productOptionId } = req.params;
    const { mainBenefitId, coverAmount, coverMemberTypeId } = req.query;

    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is required",
      });
    }

    let whereCondition: object = {};

    if (coverAmount) {
      // if coverAmount not a number then return error
      if (isNaN(Number(coverAmount))) {
        return res.status(400).json({
          success: false,
          message: "Cover amount is invalid",
        });
      }

      whereCondition = {
        ...whereCondition,
        benefitAmount: Number(coverAmount),
      };
    }

    if (mainBenefitId) {
      whereCondition = {
        ...whereCondition,
        benefitId: mainBenefitId,
      };
    }

    if (coverMemberTypeId) {
      whereCondition = {
        ...whereCondition,
        coverMemberTypeId: coverMemberTypeId,
      };
    }

    const benefits = await benefit.findAll({
      where: whereCondition,
      include: [
        {
          model: productOption,
          required: true,
          attributes: [],
          where: {
            productOptionId: productOptionId,
          },
        },
      ],
    });

    // console.log(benefits);

    // check if benefits is empty
    if (benefits.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No benefits found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Found the following member benefit rules",
      data: benefits,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const editsAllocateBenefits = async (req: Request, res: Response) => {
  try {
    const { coverAmount, ProductOptionId, PolicyMembers, PolicyId } = req.body;

    // PolicyId
    if (!PolicyId) {
      return res.status(400).json({
        success: false,
        message: `Policy id not specified`,
      });
    }

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

    // check for ProductOptionId
    if (!ProductOptionId) {
      return res.status(400).json({
        success: false,
        message: `Product option id not specified`,
      });
    }

    // check for members array of objects
    if (!PolicyMembers || PolicyMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Error, members is missing",
      });
    }

    // check if validCoverAmount for productOptionId
    const query = `
  SELECT DISTINCT([ProductOptionBenefits].[productOptionId]) AS [productOptionId], 
         [BenefitRule].[benefitAmount], 
         [ProductOptionBenefits].[productOptionId] AS [ProductOptionBenefits.productOptionId] 
  FROM [rules].[BenefitRules] AS [BenefitRule] (nolock) 
  INNER JOIN [rules].[ProductOptionBenefits] AS [ProductOptionBenefits] (nolock) 
  ON [BenefitRule].[benefitId] = [ProductOptionBenefits].[benefitId] 
  AND [ProductOptionBenefits].[productOptionId] = ${ProductOptionId} 
  WHERE [BenefitRule].[benefitAmount] = ${coverAmount} 
  ORDER BY [productOptionId] ASC;
`;

    const benefitAmount = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
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

    // console.log(members);

    const validateMembers = await PolicyMembers.map((member: any) => {
      // if member is going to be deleted or is deleted skip
      if (member.MemberAction === 3) {
        return member;
      }

      // if member.exceptions is not an array then create an empty array
      if (!member.exceptions) {
        member.exceptions = [];
      }

      if (member.endDate && isNaN(Date.parse(member.endDate))) {
        member.exceptions.push({
          message: `Invalid end date`,
          field: "endDate",
        });
        memberErrors = true;
      }

      if (member.endDate) {
        return member;
      }

      member.exceptions = [];

      // // check if ID number is provided
      // if (!member.IdNumber) {
      //   member.exceptions.push({
      //     message: `No ID number provided`,
      //     field: "IdNumber",
      //   });
      // }

      // // check if ID number is valid
      // if (member.IdTypeId === 1 && !SAIDValidator(member.IdNumber)) {
      //   member.exceptions.push({
      //     message: `Invalid ID number`,
      //     field: "IdNumber",
      //   });
      // }

      // check if ID number is unique
      if (idNumberList.includes(member.IdNumber)) {
        member.exceptions.push({
          message: `Duplicate ID number`,
          field: "IdNumber",
        });
      } else {
        idNumberList.push(member.IdNumber);
      }

      // check that member dob is valid
      if (isNaN(Date.parse(member.DateOfBirth))) {
        member.exceptions.push({
          message: `Invalid date of birth`,
          field: "dateOfBirth",
        });
      }

      // get member age
      memberAge = -1;
      memberAge = getAgeByPolicyJoinDate(
        member.DateOfBirth,
        member.PolicyInceptionDate,
      );

      member.age = memberAge === -1 ? null : memberAge;
      // check that member age is valid
      if (memberAge < 0) {
        member.exceptions.push({
          message: `Invalid age`,
          field: "dateOfBirth",
        });
      }

      // main member
      if (member.MemberTypeId === 1) {
        mainMemberCount++;
        if (mainMemberCount === 1) {
          mainMemberAllocation = member;
        } else if (mainMemberCount > 1) {
          member.exceptions.push({
            message: `Too many main members`,
            field: "MemberTypeId",
          });
        }
      }
      // spouse
      else if (member.MemberTypeId === 2) {
        spouseCount++;
        if (spouseCount === 1) {
          spouseAllocation = member;
        } else if (spouseCount > 1) {
          member.exceptions.push({
            message: `Too many spouses`,
            field: "MemberTypeId",
          });
        }
      }
      // children
      else if (member.MemberTypeId === 3) {
        childrenCount++;

        if (childrenCount > 6) {
          member.exceptions.push({
            message: `Too many children`,
            field: "MemberTypeId",
          });
        }

        if (
          (member.isDisabled || member.isStudent) &&
          member.supportDocument === null
        ) {
          member.exceptions.push({
            message: `No support document`,
            field: "supportDocument",
          });
        }
      }
      // extended family
      else if (member.MemberTypeId === 4) {
        extendedFamilyCount++;
      } else if (member.MemberTypeId === 6) {
        beneficiaryCount++;
      } else {
        unknownCount++;
        // append to member.PolicyMember.exceptions array for unknown roleplayerTypeId found
        member.exceptions.push({
          message: `Unknown roleplayer type`,
          field: "MemberTypeId",
        });
      }

      // check main member
      if (member.MemberTypeId === 1) {
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
          member.exceptions.push({
            message: `Invalid email`,
            field: "email",
          });
        }
      }

      if (!memberErrors && member.exceptions.length > 0) {
        memberErrors = true;
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
      reqBody.PolicyMembers = validateMembers;
      reqBody.status = "Error";
      return res.status(200).json({
        success: false,
        message: `Invalid member details`,
        data: reqBody,
      });
    }

    // console.log("main2", coverAmount);

    // console.log("mainMemberAllocation", mainMemberAllocation);

    // allocate main member benefit
    const mainMemberCover = await getMainMemberCover(
      ProductOptionId,
      spouseCount,
      childrenCount,
      extendedFamilyCount,
      coverAmount,
      mainMemberAllocation.age,
      mainMemberAllocation.orgBenefit || null,
      PolicyId,
      req.app.get("rmaAccessToken"),
    );

    console.log("main2", mainMemberCover);

    if (!mainMemberCover.success) {
      return res.status(400).json({
        success: false,
        message: `Main member cover amount not allocated`,
      });
    }

    const mainMemberBenefitId: number = mainMemberCover.data.benefitId;
    const mainMemberBenefit: string = mainMemberCover.data.benefit;
    let memberType: string = "";
    let subMemberCover: any = null;
    let other: number = mainMemberCover.data.familyMembers > 0 ? 4 : 0;
    let parent: number = mainMemberCover.data.familyMembersOver64;

    // sort reqBody.PolicyMembers by MemberTypeId ascending and age descending
    reqBody.PolicyMembers = reqBody.PolicyMembers.sort((a: any, b: any) => {
      if (a.MemberTypeId === b.MemberTypeId) {
        return b.age - a.age;
      }
      return a.MemberTypeId - b.MemberTypeId;
    });

    // update PolicyMembers where memberTypeId === 1 update BenefitId to returned mainMemberCover.data.benefitId in reqBody
    reqBody.PolicyMembers = await Promise.all(
      reqBody.PolicyMembers.map(async (member: any) => {
        // if member is going to be deleted or is deleted skip
        if (
          member.MemberAction === 3 ||
          member.endDate ||
          member.MemberTypeId === 6
        ) {
          return member;
        }

        if (member.MemberTypeId === 1) {
          member.BenefitId = mainMemberCover.data.benefitId;
          member.Benefit = mainMemberCover.data.benefit;
          member.Premium = mainMemberCover.data.premium;
          member.BenefitCode = mainMemberCover.data.BenefitCode;
          member.CoverAmount = mainMemberCover.data.benefitAmount;
        }

        if (member.MemberTypeId === 2) {
          const spouseCover = await getDependentCover(
            mainMemberBenefitId,
            "Spouse",
            null,
            member.age,
            coverAmount,
            PolicyId,
            req.app.get("rmaAccessToken"),
          );

          if (!spouseCover.success) {
            member.exceptions.push({
              message: `Spouse cover could not be allocated`,
              field: "CoverAmount",
            });
            memberErrors = true;
          } else {
            member.BenefitId = spouseCover.data.id;
            member.Benefit = spouseCover.data.benefit;
            member.Premium = spouseCover.data.premium;
            member.BenefitCode = spouseCover.data.BenefitCode;
            member.CoverAmount = spouseCover.data.benefitAmount;
          }
        }

        if (member.MemberTypeId === 3) {
          const subGroup = member.isStudent
            ? "Student"
            : member.isDisabled
            ? "Disabled"
            : null;
          const childCover = await getDependentCover(
            mainMemberBenefitId,
            "Child",
            subGroup,
            member.age,
            coverAmount,
            PolicyId,
            req.app.get("rmaAccessToken"),
          );

          // console.log(childCover);

          if (!childCover.success) {
            member.exceptions.push({
              message: `Child cover could not be allocated`,
              field: "CoverAmount",
            });
            memberErrors = true;
          } else {
            member.BenefitId = childCover.data.id;
            member.Benefit = childCover.data.benefit;
            member.Premium = childCover.data.premium;
            member.BenefitCode = childCover.data.BenefitCode;
            member.CoverAmount = childCover.data.benefitAmount;
          }
        }

        if (member.MemberTypeId === 4) {
          let subGroup =
            member.age >= 65 && member.age <= 84
              ? "Parent"
              : member.age >= 18 && member.age <= 64
              ? "Other"
              : null;

          if (subGroup === "Other" && other > 0) {
            other = other - 1;
          } else if (subGroup === "Parent" && parent > 0) {
            parent = parent - 1;
          } else if (subGroup === "Other" && other === 0 && parent > 0) {
            parent = parent - 1;
            subGroup = "Parent";
          } else {
            subGroup = null;
          }
          // console.log("countOther" + other);
          // console.log("countParent" + parent);

          let extendedCover: any = null;

          if (subGroup) {
            extendedCover = await getDependentCover(
              mainMemberBenefitId,
              "Extended Family",
              subGroup,
              member.age,
              coverAmount,
              PolicyId,
              req.app.get("rmaAccessToken"),
            );
          } else {
            extendedCover = await getExtendedCover(
              mainMemberBenefitId,
              member.age,
              coverAmount,
              PolicyId,
              req.app.get("rmaAccessToken"),
            );
          }

          if (!extendedCover.success) {
            member.exceptions.push({
              message: `Extended Family cover could not be allocated`,
              field: "CoverAmount",
            });
            memberErrors = true;
          } else {
            // check  if extendedCover.data is an array or an object
            // console.log("subGroup1", extendedCover);

            if (Array.isArray(extendedCover.data)) {
              // console.log("subGroup1", extendedCover);
              if (extendedCover.data.length === 1) {
                member.BenefitId = extendedCover.data[0].id;
                member.Benefit = extendedCover.data[0].benefit;
                member.Premium = extendedCover.data[0].premium;
                member.BenefitCode = extendedCover.data[0].BenefitCode;
                member.CoverAmount = extendedCover.data[0].benefitAmount;
                member.AlternativeOptions = [];
              } else if (extendedCover.data.length > 1) {
                const defaultOption = extendedCover.data.filter(
                  (option: any) => option.benefitAmount === coverAmount,
                );

                if (defaultOption.length === 1) {
                  member.BenefitId = defaultOption[0].id;
                  member.Benefit = defaultOption[0].benefit;
                  member.Premium = defaultOption[0].premium;
                  member.BenefitCode = defaultOption[0].BenefitCode;
                  member.CoverAmount = defaultOption[0].benefitAmount;
                }

                member.AlternativeOptions = extendedCover.data;
              }
            } else {
              member.BenefitId = extendedCover.data.id;
              member.Benefit = extendedCover.data.benefit;
              member.Premium = extendedCover.data.premium;
              member.BenefitCode = extendedCover.data.BenefitCode;
              member.CoverAmount = extendedCover.data.benefitAmount;
            }
          }
        }
        // console.log("subGroup2", member);
        return member;
      }),
    );

    // if memberErrors, return error message with req.body.members replaced by updatedMembers
    if (memberErrors) {
      // let reqBody = req.body and replace members with updatedMembers
      reqBody.status = "Error";
      return res.status(200).json({
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
