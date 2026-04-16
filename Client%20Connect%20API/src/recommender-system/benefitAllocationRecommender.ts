import { RuleResult } from "../lib/functional-types/result";
const {
  BenefitRule,
  DependantBenefitRule,
  ProductOptionBenefit,
  PolicyMember,
  BenefitDependantBenefitRule,
  Policy,
  Member,
  File,
} = require("../models");

import { getAgeByPolicyJoinDate } from "../utils/dates";
import { getBenefitRuleByBenefitId } from "../handlers/rulesHandler";
import { RecommenderEnums } from "../enums/recommenderEnums";
import { CoverMemberTypeEnums } from "../enums/rolePlayerTypeEnums";
import { RolePlayerTypeEnums } from "../enums/rolePlayerTypeEnums";
import { where } from "sequelize";
const { Op, Sequelize } = require("sequelize");

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

const getMainMemberCover = async (
  productOptionId: number,
  spouseCount: number,
  childrenCount: number,
  extendedFamilyCount: number,
  benefitAmount: number,
  memberAge: number,
) => {
  try {
    const benefits = await BenefitRule.findAll({
      where: {
        spouse: spouseCount,
        children: childrenCount > 0 ? { [Op.gt]: 0 } : 0,
        familyMembers: extendedFamilyCount > 0 ? { [Op.gt]: 0 } : 0,
        benefitAmount: benefitAmount,
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
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
        // "ProductOptionBenefits.productOptionId",
        "benefitId",
        "benefit",
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

    if (benefits.false) {
      return {
        success: false,
        message: `Main member cover amount rule failed`,
      };
    }

    return {
      success: true,
      message: `Main member cover amount rule passed`,
      data: benefits,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: `Main member cover amount rule failed`,
      err,
    };
  }
};

const getDependantCover = async (
  mainMemberBenefitId: number,
  memberAge: number,
  coverMemberType: string,
) => {
  try {
    const dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: coverMemberType,
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
      },
      include: [
        {
          model: BenefitRule,
          required: true,
          attributes: [],
          where: {
            benefitId: mainMemberBenefitId,
          },
        },
      ],
    });

    // console.log(dependantBenefits);

    if (dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    return {
      success: true,
      message: `Dependant cover amount rule passed`,
      data:
        coverMemberType === "Extended Family"
          ? dependantBenefits
          : dependantBenefits[0].dataValues,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: `Dependant cover amount rule failed`,
      err,
    };
  }
};

export const benefitValidation = async (data: any) => {
  try {
    // check for joinDate
    if (!data.joinDate) {
      return {
        success: false,
        message: `Join date not specified`,
      };
    }

    // TODO Valid joinDate

    // check for coverAmount
    if (!data.coverAmount) {
      return {
        success: false,
        message: `Cover amount not specified`,
      };
    }

    // check if validCoverAmount for productOptionId
    const benefitAmount = await BenefitRule.findAll({
      where: {
        benefitAmount: Number(data.coverAmount),
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
        // "ProductOptionBenefits.productOptionId",
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
            productOptionId: data.productOptionId,
          },
        },
      ],
    });

    if (benefitAmount.length === 0) {
      return {
        success: false,
        message: `Invalid cover amount`,
      };
    }

    // set roleplayerTypeId for each member
    for (let i = 0; i < data.members.length; i++) {
      data.members[i].PolicyMember["roleplayerTypeId"] = returnRoleplayerType(
        data.members[i].PolicyMember.memberTypeId,
      );
    }

    // filter for main member
    const mainMemberAllocation = data?.members?.filter(
      (Member: any) =>
        Member?.PolicyMember?.roleplayerTypeId ===
        RolePlayerTypeEnums.MAIN_MEMBER_SELF,
    )[0];

    if (!mainMemberAllocation) {
      return {
        success: false,
        message: `Main member not found`,
      };
    }

    if (mainMemberAllocation.length > 1) {
      return {
        success: false,
        message: `Invalid number of main members found`,
      };
    }

    if (!mainMemberAllocation.dateOfBirth) {
      return {
        success: false,
        message: `Main member date of birth not specified`,
      };
    }

    const mainMemberAge: number = getAgeByPolicyJoinDate(
      mainMemberAllocation.dateOfBirth,
      data.joinDate,
    );

    // check if spouse exists
    const spouseObj = data?.members?.filter(
      (Member: any) =>
        Member?.PolicyMember.roleplayerTypeId === RolePlayerTypeEnums.SPOUSE,
    )[0];

    if (spouseObj?.length > 1) {
      return {
        success: false,
        message: `Invalid number of spouses found`,
      };
    }

    const spouseCount: number = spouseObj ? 1 : 0;

    if (spouseCount > 0) {
      if (!spouseObj.dateOfBirth) {
        return {
          success: false,
          message: `Spouse date of birth not specified`,
        };
      }
    }

    // check if children exists
    const childrenObj = data?.members?.filter(
      (Member: any) =>
        Member?.PolicyMember?.roleplayerTypeId === RolePlayerTypeEnums.CHILD,
    );

    const childrenCount: number = childrenObj.length;

    // if childrenCount > 6 return false
    if (childrenCount > 6) {
      return {
        success: false,
        message: `Children count exceeds 6`,
      };
    }

    // check extended family
    const extendedFamilyObj = data?.members?.filter(
      (Member: any) =>
        Member?.PolicyMember?.roleplayerTypeId === RolePlayerTypeEnums.EXTENDED,
    );

    const extendedFamilyCount: number = extendedFamilyObj.length;

    const maimMemberCover = await getMainMemberCover(
      data.productOptionId,
      spouseCount,
      childrenCount,
      extendedFamilyCount,
      data.coverAmount,
      mainMemberAge,
    );

    if (!maimMemberCover.success) {
      return {
        success: false,
        message: `Main member cover rule failed`,
      };
    }

    // set main member cover
    mainMemberAllocation.PolicyMember["statedBenefitId"] =
      maimMemberCover.data[0].benefitId;
    mainMemberAllocation.PolicyMember["statedBenefit"] =
      maimMemberCover.data[0].benefit;
    mainMemberAllocation.PolicyMember.benefit = !mainMemberAllocation
      .PolicyMember.benefit
      ? maimMemberCover.data[0].benefit
      : mainMemberAllocation.PolicyMember.benefit;

    let memberAge: number;

    if (spouseCount > 0) {
      memberAge = getAgeByPolicyJoinDate(spouseObj.dateOfBirth, data.joinDate);
      const spouseBenefit = await getDependantCover(
        maimMemberCover.data[0].benefitId,
        memberAge,
        "Spouse",
      );

      if (!spouseBenefit.success) {
        return {
          success: false,
          message: `Spouse cover rule failed`,
        };
      }

      spouseObj.PolicyMember["statedBenefitId"] = spouseBenefit.data.id;
      spouseObj.PolicyMember["statedBenefit"] = spouseBenefit.data.benefit;
      spouseObj.PolicyMember.benefit = !spouseObj.PolicyMember.benefit
        ? spouseBenefit.data.benefit
        : spouseObj.PolicyMember.benefit;
    }

    // set children cover
    if (childrenCount > 0) {
      for (let i = 0; i < childrenCount; i++) {
        memberAge = getAgeByPolicyJoinDate(
          childrenObj[i].dateOfBirth,
          data.joinDate,
        );

        // add child age check
        // console.log(childrenObj[i]);

        if (
          (memberAge > 21 &&
            !childrenObj[i].PolicyMember.isStudent &&
            !childrenObj[i].PolicyMember.isDisabled) ||
          (memberAge > 25 && childrenObj[i].PolicyMember.isStudent)
        ) {
          let exceptions = childrenObj[i].exceptions;
          if (!exceptions) {
            exceptions = [];
          }
          exceptions.push({ error: "Child age exceeds prescribed age" });

          childrenObj[i].PolicyMember["exceptions"] = exceptions;

          continue;
        }

        if (
          (memberAge > 21 &&
            memberAge <= 25 &&
            childrenObj[i].PolicyMember.isStudent) ||
          (memberAge > 21 && childrenObj[i].policyMember.isDisabled)
        ) {
          let exceptions = childrenObj[i].PolicyMember.exceptions;

          // check if exception containts error: "Child age exceeds 21" and remove it
          if (exceptions) {
            exceptions = exceptions.filter(
              (exception: any) =>
                exception.error !== "Child age exceeds prescribed age",
            );
          }

          childrenObj[i].PolicyMember["exceptions"] = exceptions;
        }

        const childBenefit = await getDependantCover(
          maimMemberCover.data[0].benefitId,
          memberAge,
          "Child",
        );

        // set child cover
        childrenObj[i].PolicyMember["statedBenefitId"] = childBenefit.data.id;
        childrenObj[i].PolicyMember["statedBenefit"] =
          childBenefit.data.benefit;
        childrenObj[i].PolicyMember.benefit = !childrenObj[i].PolicyMember
          ? childBenefit.data.benefit
          : childrenObj[i].PolicyMember.benefit;
      }
    }

    // set extended family cover
    if (extendedFamilyCount > 0) {
      let otherCounter = 0;
      let parentCounter = 0;
      let maxFamily = false;
      for (let i = 0; i < extendedFamilyCount; i++) {
        memberAge = getAgeByPolicyJoinDate(
          extendedFamilyObj[i].dateOfBirth,
          data.joinDate,
        );
        if (8 - otherCounter - parentCounter === 0) {
          maxFamily = true;
        }
        if (memberAge > 64 && memberAge < 85 && parentCounter < 4) {
          parentCounter++;
        } else {
          otherCounter++;
        }
        const extendedFamilyBenefits = await getDependantCover(
          maimMemberCover.data[0].benefitId,
          memberAge,
          "Extended Family",
        );

        if (!extendedFamilyBenefits.success) {
          return {
            success: false,
            message: `Extended family cover rule failed`,
          };
        }
        // console.log(extendedFamilyBenefits);

        let extendedFamilyBenefit: any = {};

        // cycle through extended family benefits and set the correct benefit
        for (let j = 0; j < extendedFamilyBenefits.data.length; j++) {
          // console.log(extendedFamilyBenefits.data[j].dataValues);
          if (
            memberAge > 64 &&
            memberAge < 85 &&
            parentCounter <= 4 &&
            !maxFamily &&
            extendedFamilyBenefits.data[j].dataValues.benefit
              .toLowerCase()
              .includes("parent")
          ) {
            extendedFamilyBenefit = extendedFamilyBenefits.data[j].dataValues;
            break;
          } else if (
            memberAge < 85 &&
            !maxFamily &&
            extendedFamilyBenefits.data[j].dataValues.benefit
              .toLowerCase()
              .includes("other")
          ) {
            extendedFamilyBenefit = extendedFamilyBenefits.data[j].dataValues;
            break;
          } else if (
            memberAge >= 85 &&
            extendedFamilyBenefits.data[j].dataValues.benefit
              .toLowerCase()
              .includes("extended")
          ) {
            extendedFamilyBenefit = extendedFamilyBenefits.data[j].dataValues;
            break;
          } else if (
            maxFamily &&
            extendedFamilyBenefits.data[j].dataValues.benefit
              .toLowerCase()
              .includes("extended")
          ) {
            extendedFamilyBenefit = extendedFamilyBenefits.data[j].dataValues;
            break;
          }
        }

        // console.log(`Age: ${memberAge}`);
        // console.log(extendedFamilyBenefit);

        if (!extendedFamilyBenefit) {
          return {
            success: false,
            message: `Extended family cover rule failed`,
          };
        }

        //set extended family cover
        extendedFamilyObj[i].PolicyMember["statedBenefitId"] =
          extendedFamilyBenefit?.id;
        extendedFamilyObj[i].PolicyMember["statedBenefit"] =
          extendedFamilyBenefit?.benefit;
        extendedFamilyObj[i].PolicyMember.benefit = !extendedFamilyObj[i]
          ? extendedFamilyBenefit?.benefit
          : extendedFamilyObj[i].PolicyMember.benefit;
      }
    }

    // console.log(mainMemberAllocation);

    data.members = [
      mainMemberAllocation,
      ...(spouseObj ? [spouseObj] : []),
      ...childrenObj,
      ...extendedFamilyObj,
    ];

    return {
      success: true,
      message: `Benefit validation passed`,
      data: data,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: `Benefit validation failed`,
      err,
    };
  }
};

const mainMemberAllocationRecommender = async (
  data: any,
): Promise<RuleResult<any, Error>> => {
  //const { policy } = policyBenefits

  const policyMembers = data.members.reduce(
    (acc: any, member: any) =>
      member?.dateOfBirth && member?.dateOfBirth != null
        ? {
            membersAcceptedByDOB: [
              ...acc.membersAcceptedByDOB,
              {
                id: member.id,
                firstName: member.firstName,
                surname: member.surname,
                age: getAgeByPolicyJoinDate(member.dateOfBirth, data.joinDate),
                coverMemberType: member.PolicyMember.memberTypeId,
              },
            ],
          }
        : {
            membersRejectedByDOB: [
              ...acc.membersRejectedByDOB,
              {
                id: member.id,
                firstName: member.firstName,
                surname: member.surname,
                age: getAgeByPolicyJoinDate(member.dateOfBirth, data.joinDate),
                coverMemberType: member.PolicyMember.memberTypeId,
              },
            ],
          },
    { membersAcceptedByDOB: [], membersRejectedByDOB: [] },
  );

  // Fix the code smell of this repeated filter.
  const mainMember = policyMembers.membersAcceptedByDOB.filter(
    (member: any) => member.coverMemberType === 1,
  );
  const spouse = policyMembers.membersAcceptedByDOB.filter(
    (member: any) => member.coverMemberType === 2,
  );
  const children = policyMembers.membersAcceptedByDOB.filter(
    (member: any) => member.coverMemberType === 3,
  );
  const extended = policyMembers.membersAcceptedByDOB.filter(
    (member: any) => member.coverMemberType === 4,
  );

  if (mainMember.length !== 1) {
    return {
      success: false,
      message: `Invalid number of main members found`,
      err: mainMember,
    };
  } else {
    //const { productOption } = policy.data
    const { productOptionId, name } = data;

    //const productOptionId = parseInt(data.productOptionId)

    // Move this to db handler.
    const benefitRules = await BenefitRule.findAll(
      {
        include: [{ model: DependantBenefitRule, attributes: [] }],
        where: { productOptionId },
      },
      { raw: true },
    );

    /**
     * TODO
     * 1. Extract and refactor this logic into a recommender system.
     * 2. Convert these recommender filter functions to functional filter class/models
     * 3. Reduce and extract the benefitId's (also matrix factorization/item based filtering)
     * 4. Find the common benefitId across each category
     */

    //1. Main member age filtered by cover amount.
    const filteredByCoverAmount = (data: any) =>
      benefitRules.filter(
        (rule: any) => rule.benefitAmount === data.coverAmount,
      );

    //2. Main Member filtered by age.
    const filteredByMainMemberAge = (mainMember: any) =>
      benefitRules.filter(
        (rule: any) =>
          rule.minAge <= mainMember[0].age && rule.maxAge >= mainMember[0].age,
      );

    //3. Spouse
    const filteredBySpouse = (spouse: any) =>
      spouse.length === 0
        ? benefitRules.filter((rule: any) => rule.spouse === 0)
        : benefitRules.filter((rule: any) => rule.spouse > 0);

    //4. Children
    const filteredByChildren = (children: any) =>
      children.length > 0
        ? benefitRules.filter((rule: any) => rule.children > 0)
        : benefitRules.filter((rule: any) => rule.children < 1);
    //0. Family Members - Missing cover member type
    const filteredByFamilyMembers = (familyMembers: any) =>
      familyMembers.length > 0
        ? benefitRules.filter((rule: any) => rule.familyMembers > 0)
        : benefitRules.filter((rule: any) => rule.familyMembers < 1);

    //6. Extended
    const filteredByExtendedFamily = (extended: any) =>
      extended.length > 0
        ? benefitRules.filter((rule: any) => rule.extended > 0)
        : benefitRules.filter((rule: any) => rule.extended < 1);

    // Helper function to filter by a property.
    const filterBy = (f: Function, x: any[], prop: string) =>
      f(x).reduce((a: any[], b: any) => [...a, b[prop]], []);

    //7. Recommender system, filter the benefitIds across each category.
    const recommenderSystem = {
      byCoverAmount: filterBy(filteredByCoverAmount, data, "benefitId"),
      byAge: filterBy(filteredByMainMemberAge, mainMember, "benefitId"),
      withSpouse: filterBy(filteredBySpouse, spouse, "benefitId"),
      withChildren: filterBy(filteredByChildren, children, "benefitId"),
      withExtended: filterBy(filteredByExtendedFamily, extended, "benefitId"),
      [Symbol.iterator]: function* () {
        yield this.byCoverAmount;
        yield this.byAge;
        yield this.withSpouse;
        yield this.withChildren;
        yield this.withExtended;
      },
    };

    const recommenderResult = (recommender: any) => {
      const weight = Object.values(recommender).length;

      const flattenAndConcat = (acc: any, val: any) => acc.concat(val);

      const basicSort = (a: any, b: any) => a - b;

      const summariseAndCount = (acc: any, val: any) => {
        if (acc[val]) {
          acc[val] = acc[val] + 1;
        } else {
          acc[val] = 1;
        }
        return acc;
      };

      const flattenedBenefits: any =
        Object.values(recommender).reduce(flattenAndConcat);

      const sorted = flattenedBenefits.sort(basicSort);

      const reducedWeightedBenefits = sorted.reduce(summariseAndCount, {});

      let output: any = {};

      for (let benefitId in reducedWeightedBenefits) {
        reducedWeightedBenefits[benefitId] === weight
          ? (output[RecommenderEnums["Recommended"]] = {
              ...output[RecommenderEnums["Recommended"]],
              benefitId,
            })
          : reducedWeightedBenefits[benefitId] === weight - 1
          ? (output[RecommenderEnums["Second Recommendation"]] = {
              ...output[RecommenderEnums["Second Recommendation"]],
              benefitId,
            })
          : output;
      }

      return { recommendedBenefitAllocation: output };
    };

    if (productOptionId != null) {
      const recommendation = recommenderResult(recommenderSystem);

      const { recommendedBenefitAllocation } = recommendation;
      const { benefitId } =
        recommendedBenefitAllocation["1"] ?? recommendedBenefitAllocation["2"];

      const fullName = (firstName: string, lastName: string) =>
        `${firstName} ${lastName}`;

      const mainMemberBenefit = await getBenefitRuleByBenefitId(benefitId)
        .then((benefit) =>
          benefit.success ? benefit.data : Promise.reject(benefit),
        )
        .catch((err) => err);

      const { DependantBenefitRules } = mainMemberBenefit;

      const getDependantBenefits = (
        data: any[],
        dependantBenefits: any[],
        coverMemberType: string,
      ) =>
        data.length > 0
          ? data.map((dependant: any) => ({
              id: dependant.id,
              name: fullName(dependant.firstName, dependant.surname),
              age: dependant.age,
              coverMemberType: dependant.coverMemberType,
              benefit: dependantBenefits.filter(
                (rule: any) =>
                  rule.minAge <= dependant.age &&
                  rule.maxAge >= dependant.age &&
                  rule.coverMemberType === coverMemberType,
              ),
            }))
          : [];

      const getBenefits = (
        data: any[],
        benefits: any[],
        coverMemberType: string,
      ) =>
        data.length > 0
          ? data.map((member: any) => ({
              id: member.id,
              name: fullName(member.firstName, member.surname),
              age: member.age,
              coverMemberType: member.coverMemberType,
              benefit: [
                {
                  id: benefits[0].id,
                  benefit: benefits[0].benefit,
                  minAge: benefits[0].minAge,
                  maxAge: benefits[0].maxAge,
                  benefitId: benefits[0].benefitId,
                  benefitAmount: benefits[0].benefitAmount,
                  coverMemberType: coverMemberType,
                  createdAt: benefits[0].createdAt,
                  updatedAt: benefits[0].updatedAt,
                },
              ],
            }))
          : [];

      const mainMemberBenefits = getBenefits(
        mainMember,
        [mainMemberBenefit],
        "Main Member",
      );
      const childBenefits = getDependantBenefits(
        children,
        DependantBenefitRules,
        "Child",
      );
      const spouseBenefits = getDependantBenefits(
        spouse,
        DependantBenefitRules,
        "Spouse",
      );
      const extendedFamilyBenefits = getDependantBenefits(
        extended,
        DependantBenefitRules,
        "Extended Family",
      );

      return recommendation
        ? {
            success: true,
            message: `Product option allocation for main member passed, Recommended benefit allocation `,
            data: [
              ...mainMemberBenefits,
              ...childBenefits,
              ...spouseBenefits,
              ...extendedFamilyBenefits,
            ],

            // Response is K N N complete and can return multiple recommended benefit id's or the closest optimal one.
            // It can become complete with more data. But it still further improves the number of required roundtrips
            // to parse the data through the rule engine as you are further only working with the most accurate benefit rules.
          }
        : {
            success: false,
            message: `Product option allocation for main member failed`,
            err: [recommendation],
          };
    } else {
      return {
        success: false,
        message: `Invalid type product option id ${productOptionId} or policy option id ${productOptionId} specified.`,
        err: [],
      };
    }
  }
};

export default mainMemberAllocationRecommender;
