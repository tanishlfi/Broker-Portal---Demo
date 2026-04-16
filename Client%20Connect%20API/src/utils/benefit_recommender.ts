const {
  BenefitRule,
  ProductOptionBenefit,
  DependantBenefitRule,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";

export const returnRoleplayerType = (memberTypeId: number) => {
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
// return the description of the member type
export const returnMemberType = (memberTypeId: number) => {
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

export const getMainMemberCover = async (
  productType: string,
  productOptionId: number,
  spouseCount: number,
  childrenCount: number,
  extendedFamilyCount: number,
  benefitAmount: number,
  memberAge: number,
  providerInceptionDate: Date,
) => {
  try {
    let whereCondition: any = {};
    if (productType === "Scheme") {
      // if scheme inception date is not null, then we need to check if the inception date is before 2023-02-01
      // if it is before 2023-02-01, then we need to use the old rules
      // if it is after 2023-02-01, then we need to use the new rules
      const schemeInceptionDateYear = new Date(
        providerInceptionDate,
      ).getFullYear();
      const schemeInceptionDateMonth = new Date(
        providerInceptionDate,
      ).getMonth();
      const schemeInceptionDateDay = new Date(providerInceptionDate).getDate();

      const schemeInceptionDateNew = new Date(2023, 2, 1);
      const schemeInceptionDateNewYear = new Date(
        schemeInceptionDateNew,
      ).getFullYear();
      const schemeInceptionDateNewMonth = new Date(
        schemeInceptionDateNew,
      ).getMonth();
      const schemeInceptionDateNewDay = new Date(
        schemeInceptionDateNew,
      ).getDate();

      if (
        schemeInceptionDateYear >= schemeInceptionDateNewYear &&
        schemeInceptionDateMonth >= schemeInceptionDateNewMonth &&
        schemeInceptionDateDay >= schemeInceptionDateNewDay
      ) {
        // use new rules
        whereCondition = {
          spouse: spouseCount > 0 ? 1 : 0,
          children: childrenCount > 0 ? { [Op.gt]: 0 } : 0,
          benefitAmount: benefitAmount,
          minAge: { [Op.lte]: memberAge },
          maxAge: { [Op.gte]: memberAge },
        };
      } else {
        // use old rules
        whereCondition = {
          spouse: spouseCount > 0 || childrenCount > 0 ? 1 : 0,
          children: childrenCount > 0 || spouseCount > 0 ? { [Op.gt]: 0 } : 0,
          familyMembers: extendedFamilyCount > 0 ? { [Op.gt]: 0 } : 0,
          benefitAmount: benefitAmount,
          minAge: { [Op.lte]: memberAge },
          maxAge: { [Op.gte]: memberAge },
        };
      }
    }

    const benefits = await BenefitRule.findAll({
      where: whereCondition,
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
        "benefitAmount",
        "coverMemberTypeId",
        "minAge",
        "maxAge",
        "spouse",
        "children",
        "childMinAge",
        "childMaxAge",
        "studentChildMinAge",
        "studentChildMaxAge",
        "disabledChildMinAge",
        "disabledChildMaxAge",
        "familyMembers",
        "familyMemberMinAge",
        "familyMemberMaxAge",
        "familyMembersOver64",
        "extended",
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

    if (!benefits || benefits.length === 0) {
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
    return sequelizeErrorHandler(err);
  }
};

export const getDependantCoverSpouse = async (
  mainMemberBenefitId: number,
  memberAge: number,
) => {
  try {
    var dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: "Spouse",
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
      },
      raw: true,
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

    if (dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    // filter dependantBenefit check if "G.S. Spouse @%" is a benefit and set that as statedBenefit
    const spouseBenefit = dependantBenefits.filter((benefit: any) => {
      return benefit.benefit.includes("G.S. Spouse @");
    });

    if (spouseBenefit.length > 0) {
      dependantBenefits = spouseBenefit;
    }

    return {
      success: true,
      message: `Dependant cover amount rule passed`,
      data: dependantBenefits,
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

export const getDependantCoverChild = async (
  mainMemberBenefitId: number,
  memberAge: number,
) => {
  try {
    var dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: "Child",
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
      },
      raw: true,
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

    if (dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    // filter dependantBenefit check iff "G.S. Child (1-6) @" or "G.S. Child (6-13) @" or "G.S. Child (14-21) @" is a benefit and set that as statedBenefit
    const childBenefit = dependantBenefits.filter((benefit: any) => {
      return (
        benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(0-0)@") ||
        benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(1-5)@") ||
        benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(6-13)@") ||
        benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(14-21)@")
      );
    });
    if (childBenefit.length > 0) {
      dependantBenefits = childBenefit;
    }

    return {
      success: true,
      message: `Dependant cover amount rule passed`,
      data: dependantBenefits,
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

export const getDependantCoverOther = async (
  mainMemberBenefitId: number,
  memberAge: number,
  subMemberCover: string,
) => {
  try {
    var dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: "Extended Family",
        subGroup: subMemberCover,
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
      },
      raw: true,
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

    if (dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    // filter dependantBenefit check if parent benefit present
    if (subMemberCover === "Parent") {
      const parentBenefit = dependantBenefits.filter((benefit: any) => {
        return benefit.benefit.replace(/\s+/g, "").includes("G.S.Parent@");
      });
      if (parentBenefit.length > 0) {
        dependantBenefits = parentBenefit;
      }
    }

    if (subMemberCover === "Other") {
      const parentBenefit = dependantBenefits.filter((benefit: any) => {
        return benefit.benefit.replace(/\s+/g, "").includes("G.S.Other@");
      });
      if (parentBenefit.length > 0) {
        dependantBenefits = parentBenefit;
      }
    }

    return {
      success: true,
      message: `Dependant cover amount rule passed`,
      data: dependantBenefits,
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

export const getDependantCover = async (
  mainMemberBenefitId: number,
  memberAge: number,
  coverMemberType: string,
  subMemberCover: any = null,
) => {
  try {
    if (coverMemberType === "Spouse") {
      return await getDependantCoverSpouse(mainMemberBenefitId, memberAge);
    }
    if (coverMemberType === "Child") {
      return await getDependantCoverChild(mainMemberBenefitId, memberAge);
    }
    if (subMemberCover === "Parent" || subMemberCover === "Other") {
      return await getDependantCoverOther(
        mainMemberBenefitId,
        memberAge,
        subMemberCover,
      );
    }
    var dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: coverMemberType,
        subGroup: subMemberCover,
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
      },
      raw: true,
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

    if (dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    console.log(dependantBenefits);

    // if (coverMemberType === "Extended Family") {
    //   // filter dependantBenefit check iff "G.S. Child (1-6) @" or "G.S. Child (6-13) @" or "G.S. Child (14-21) @" is a benefit and set that as statedBenefit
    //   const childBenefit = dependantBenefits.filter((benefit: any) => {
    //     return (
    //       benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(0-0)@") ||
    //       benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(1-6)@") ||
    //       benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(6-13)@") ||
    //       benefit.benefit.replace(/\s+/g, "").includes("G.S.Child(14-21)@")
    //     );
    //   });
    //   if (childBenefit.length > 0) {
    //     dependantBenefits = childBenefit;
    //   }
    // }

    return {
      success: true,
      message: `Dependant cover amount rule passed`,
      data: dependantBenefits,
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
