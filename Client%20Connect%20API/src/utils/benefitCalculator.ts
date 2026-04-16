const {
  BenefitRule,
  ProductOptionBenefit,
  DependantBenefitRule,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { rmaAPI } from "../utils/rmaAPI";

// just premium calc
const justPremiumCalc = async (
  baseRate: number,
  adminPercentage: number,
  commissionPercentage: number,
  binderFeePercentage: number,
  premiumAdjustmentPercentage: number,
) => {
  try {
    // calculate premium
    const adjBaseRate: number =
      baseRate + baseRate * premiumAdjustmentPercentage;
    const officePremium: number =
      adjBaseRate / (1 - commissionPercentage + binderFeePercentage);
    const adminFee: number = officePremium * adminPercentage;
    const premium: number = officePremium + adminFee;

    return {
      success: true,
      message: `Benefit premium fetched successfully`,
      data: {
        adjBaseRate,
        officePremium,
        adminFee,
        premium,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to get benefit premium`,
    };
  }
};

// get benefit premium using benefit id and policyId
const getBenefitPremium = async (
  benefitId: number,
  policyId: number,
  accessToken: string,
) => {
  try {
    const benefitInfo = await rmaAPI(
      `clc/api/Product/Benefit/${benefitId}`,
      accessToken,
    );

    if (!benefitInfo) {
      return {
        success: false,
        message: `Failed to get benefit premium`,
      };
    }

    // get policy info
    const policyInfo = await rmaAPI(
      `clc/api/Policy/Policy/${policyId}`,
      accessToken,
    );

    if (!policyInfo) {
      return {
        success: false,
        message: `Failed to get policy info`,
      };
    }

    // get current base rate for the benefit by filtering benefitInfo.data.benefitRates where benefitRateStatusText is "Current"
    const currentBaseRate = benefitInfo.data.benefitRates.filter(
      (rate: any) => rate.benefitRateStatusText === "Current",
    );

    const baseRate: number = currentBaseRate[0].baseRate;
    const adminPercentage: number = policyInfo.data.adminPercentage;
    const commissionPercentage: number = policyInfo.data.commissionPercentage;
    const binderFeePercentage: number = policyInfo.data.binderFeePercentage;
    const premiumAdjustmentPercentage =
      policyInfo.data.premiumAdjustmentPercentage;

    // calculate premium
    const adjBaseRate: number =
      baseRate + baseRate * premiumAdjustmentPercentage;
    const officePremium: number =
      adjBaseRate / (1 - commissionPercentage + binderFeePercentage);
    const adminFee: number = officePremium * adminPercentage;
    const premium: number = officePremium + adminFee;

    return {
      success: true,
      message: `Benefit premium fetched successfully`,
      data: {
        benefitCode: benefitInfo.data.code,
        benefitAmount: currentBaseRate[0].benefitAmount,
        baseRate,
        adminPercentage,
        commissionPercentage,
        binderFeePercentage,
        premiumAdjustmentPercentage,
        adjBaseRate,
        officePremium,
        adminFee,
        premium,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to get benefit premium`,
    };
  }
};

export const getMainMemberCover = async (
  productOptionId: number,
  spouseCount: number,
  childrenCount: number,
  extendedFamilyCount: number,
  benefitAmount: number,
  memberAge: number,
  currentBenefit: string | null,
  policyId: number,
  accessToken: string,
) => {
  try {
    let whereCondition: any = {
      // spouse: spouseCount > 0 || childrenCount > 0 ? 1 : 0,
      // children: childrenCount > 0 || spouseCount > 0 ? { [Op.gt]: 0 } : 0,
      // familyMembers: extendedFamilyCount > 0 ? { [Op.gt]: 0 } : 0,
      benefitAmount: benefitAmount,
      minAge: { [Op.lte]: memberAge },
      maxAge: { [Op.gte]: memberAge },
    };

    if (extendedFamilyCount > 0) {
      whereCondition = {
        ...whereCondition,
        familyMembers: { [Op.gt]: 0 },
      };
    } else {
      whereCondition = {
        ...whereCondition,
        spouse: spouseCount > 0 ? 1 : 0,
        children: childrenCount > 0 ? { [Op.gt]: 0 } : 0,
      };
    }

    let benefits = await BenefitRule.findAll({
      where: whereCondition,
      raw: true,
      attributes: [
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
      include: [
        {
          model: ProductOptionBenefit,
          required: true,
          attributes: [],
          where: {
            productOptionId: productOptionId,
          },
        },
      ],
    });

    console.log(`Benefits: ${JSON.stringify(benefits)}`);

    // redo calculation if no benefits found
    if (!benefits || benefits.length === 0) {
      whereCondition = {
        spouse: spouseCount > 0 || childrenCount > 0 ? 1 : 0,
        children: childrenCount > 0 || spouseCount > 0 ? { [Op.gt]: 0 } : 0,
        familyMembers: 0,
        benefitAmount: benefitAmount,
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
      };

      benefits = await BenefitRule.findAll({
        where: whereCondition,
        raw: true,
        attributes: [
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
        include: [
          {
            model: ProductOptionBenefit,
            required: true,
            attributes: [],
            where: {
              productOptionId: productOptionId,
            },
          },
        ],
      });
    }

    if (!benefits || benefits.length === 0) {
      return {
        success: false,
        message: `Main member cover amount rule failed`,
      };
    }

    // console.log("currentBenefit", currentBenefit);
    // filter benefits based on current benefit, if current benefit contains ex.comm then filter benefits that contain ex.comm else filter benefits that do not contain ex.comm, filter needs to check all lower case
    const filteredBenefit = benefits.filter((benefit: any) => {
      if (currentBenefit && currentBenefit.toLowerCase().includes("ex.com")) {
        return benefit.benefit.toLowerCase().includes("ex.com");
      } else {
        return !benefit.benefit.toLowerCase().includes("ex.com");
      }
    });

    const benefitPremium = await getBenefitPremium(
      filteredBenefit[0].benefitId,
      policyId,
      accessToken,
    );

    if (!benefitPremium.success) {
      return {
        success: false,
        message: `Main member cover amount rule failed`,
      };
    }

    // console.log(benefitPremium?.data);

    // set filteredBenefit[0].premium to benefitPremium.data.premium
    filteredBenefit[0].premium = benefitPremium?.data?.premium || 0;
    filteredBenefit[0].BenefitCode = benefitPremium?.data?.benefitCode || "";

    return {
      success: true,
      message: `Main member cover amount rule passed`,
      data: filteredBenefit[0],
    };
  } catch (err: any) {
    return sequelizeErrorHandler(err);
  }
};

// get dependent cover using mainMemberBenefitId, productOptionId, dependentType, subGroup, dependentAge, benefitAmount, policyId, accessToken
export const getDependentCover = async (
  mainMemberBenefitId: number,
  memberType: string,
  subGroup: string | null,
  memberAge: number,
  benefitAmount: number,
  policyId: number,
  accessToken: string,
) => {
  try {
    let dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: memberType,
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
        subGroup: subGroup,
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

    // console.log(dependantBenefits.length);

    if (!dependantBenefits || dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    // filter dependantBenefit check if "G.S. Spouse @%" is a benefit and set that as statedBenefit
    if (memberType === "Spouse") {
      const spouseBenefit = dependantBenefits.filter((benefit: any) => {
        return benefit.benefit.includes("G.S. Spouse @");
      });

      if (spouseBenefit.length > 0) {
        dependantBenefits = spouseBenefit;
      }
    }

    // filter dependantBenefit check if "G.S. Child%" is a benefit and set that as statedBenefit
    if (memberType === "Child") {
      const childBenefit = dependantBenefits.filter((benefit: any) => {
        return benefit.benefit.includes("G.S. Child");
      });

      if (childBenefit.length > 0) {
        dependantBenefits = childBenefit;
      }
    }

    const benefitPremium = await getBenefitPremium(
      dependantBenefits[0].id,
      policyId,
      accessToken,
    );

    if (!benefitPremium.success) {
      return {
        success: false,
        message: `Member cover amount rule failed`,
      };
    }

    // console.log(benefitPremium?.data);

    dependantBenefits[0].premium = benefitPremium?.data?.premium || 0;
    dependantBenefits[0].BenefitCode = benefitPremium?.data?.benefitCode || "";

    return {
      success: true,
      message: `Dependant cover amount rule passed`,
      data: dependantBenefits[0],
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

// get extended family cover using mainMemberBenefitId, productOptionId, dependentType, subGroup, dependentAge, benefitAmount, policyId, accessToken
export const getExtendedCover = async (
  mainMemberBenefitId: number,
  memberAge: number,
  benefitAmount: number,
  policyId: number,
  accessToken: string,
) => {
  try {
    let dependantBenefits = await DependantBenefitRule.findAll({
      where: {
        coverMemberType: "Extended Family",
        minAge: { [Op.lte]: memberAge },
        maxAge: { [Op.gte]: memberAge },
        subGroup: null,
        benefitAmount: { [Op.lte]: benefitAmount },
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

    // console.log(dependantBenefits);

    if (!dependantBenefits || dependantBenefits.length === 0) {
      return {
        success: false,
        message: `Dependant cover amount rule failed`,
      };
    }

    // get premium for each of the dependantBenefits
    for (let i = 0; i < dependantBenefits.length; i++) {
      const benefitPremium = await getBenefitPremium(
        dependantBenefits[i].id,
        policyId,
        accessToken,
      );

      if (!benefitPremium.success) {
        return {
          success: false,
          message: `Member cover amount rule failed`,
        };
      }

      // console.log(benefitPremium?.data);

      dependantBenefits[i].premium = benefitPremium?.data?.premium || 0;
      dependantBenefits[i].BenefitCode =
        benefitPremium?.data?.benefitCode || "";
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
