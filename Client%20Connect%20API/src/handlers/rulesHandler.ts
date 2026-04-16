import { sequelizeErrorHandler } from "../middleware/sequelize_error";

const {
  MemberBenefitRule,
  BenefitRule,
  DependantBenefitRule,
  ChildBenefitRule,
  FamilyBenefitRule,
  sequelize,
  Sequelize,
} = require("../models");
const { Op } = Sequelize;

/**
 * GLOBAL MEMBER BENEFIT RULES
 */

export const getAllMemberBenefitRules = async () =>
  await MemberBenefitRule.findAll(
    {
      // include: [
      //   {
      //     model: BenefitRule,
      //     as: "rules",
      //     include: [
      //       {
      //         model: ChildBenefitRule,
      //         as: "child",
      //       },
      //       {
      //         model: FamilyBenefitRule,
      //         as: "familyMember",
      //       },
      //     ],
      //   },
      // ],
    },
    { returning: true },
  )
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const getMemberBenefitRuleById = async (id: string) =>
  await MemberBenefitRule.findOne(
    {
      where: { id },
      // include: [
      //   {
      //     model: BenefitRule,
      //     as: "rules",
      //     include: [
      //       {
      //         model: ChildBenefitRule,
      //         as: "child",
      //       },
      //       {
      //         model: FamilyBenefitRule,
      //         as: "familyMember",
      //       },
      //     ],
      //   },
      // ],
    },
    { returning: true },
  )
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const getBenefitByBenefitId = async (benefitId: string) =>
  await MemberBenefitRule.findAll(
    {
      where: {
        benefitId: benefitId,
      },
    },

    { returning: true },
  )
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const createBenefit = async (benefits: any) =>
  await MemberBenefitRule.create(benefits, { returning: true })
    .then((createdBenefit: any) => createdBenefit)
    .catch((err: any) => err);

export const updateBenefitById = async (id: string, benefit: any) =>
  await MemberBenefitRule.update({ id, ...benefit }, { returning: true })
    .then((updatedBenefit: any) => updatedBenefit)
    .catch((err: any) => err);

/**
 * GLOBAL CHILD BENEFIT RULES
 */

export const getAllChildBenefits = async () =>
  await ChildBenefitRule.findAll({}, { returning: true })
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const getChildBenefitById = async (id: string) =>
  await ChildBenefitRule.findByPk(id, { returning: true })
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const createChildBenefit = async (benefits: any) =>
  await ChildBenefitRule.create(benefits, { returning: true })
    .then((createdBenefit: any) => createdBenefit)
    .catch((err: any) => err);

export const updateChildBenefitById = async (id: string, benefit: any) =>
  await ChildBenefitRule.update({ id, ...benefit }, { returning: true })
    .then((updatedBenefit: any) => updatedBenefit)
    .catch((err: any) => err);

/**
 * GLOBAL FAMILY BENEFIT RULES.
 */

export const getAllFamilyBenefits = async () =>
  await FamilyBenefitRule.findAll({}, { returning: true })
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const getFamilyBenefitById = async (id: string) =>
  await FamilyBenefitRule.findByPk(id, { returning: true })
    .then((benefits: any) => benefits)
    .catch((err: any) => err);

export const createFamilyBenefit = async (benefits: any) =>
  await FamilyBenefitRule.create(benefits, { returning: true })
    .then((createdBenefit: any) => createdBenefit)
    .catch((err: any) => err);

export const updateFamilyBenefitById = async (id: string, benefit: any) =>
  await FamilyBenefitRule.update({ id, ...benefit }, { returning: true })
    .then((updatedBenefit: any) => updatedBenefit)
    .catch((err: any) => err);

/**
 * BENEFIT RULE
 */

export const getAllBenefitRules = async () => {
  try {
    const benefitRules = await BenefitRule.findAll({}, { returning: true })

    return {
      success: true,
      message: benefitRules.length === 0 ? 
          'Empty, please add some benefit rules.'
        : 'Found the following benefit rules',
      data: benefitRules
    }
  } catch(err: any){
    return sequelizeErrorHandler(err)
  }
}
  

export const getBenefitRuleById = async (id: string) => {
  try {
    const benefit = await BenefitRule.findByPk(id, { returning: true })
    
    return {
      success: true,
      message: benefit != null ? 
        'Found the following benefit rule.' 
      : `Can't find rule by id ${id}.`,
      data: benefit
    }
  } catch (err: any) {
    return sequelizeErrorHandler(err)
  }
}
  

export const getBenefitRuleByBenefitId = async (benefitId: string) =>{
  try {
    // const benefit = await BenefitRule.findOne({ 
    //   where: { benefitId }}, { returning: true })

    const benefit = await BenefitRule.findOne({
      include: {
        model: DependantBenefitRule,
        through: {  attributes: [] }
      },
      where: { benefitId } },
      { raw: true })
    
    return {
      success: true,
      message: benefit != null ? 
        'Found the following benefit rule.' 
      : `Can't find rule with RMA benefitid ${benefitId}.`,
      data: benefit
    }
  } catch (err: any) {
    console.log(err)
    return sequelizeErrorHandler(err)
  }
}
  
export const createBenefitRule = async (benefits: object) => {
  try {

    const createdBenefit = await BenefitRule.create(benefits, { returning : true })

    return {
      success: true,
      message: createdBenefit.hasProperty('dataValues') ? 
        'Created the following benefit rule.' 
      : `Can't create benefit`,
      data: createdBenefit.dataValues
    }
  } catch (err: any) {
    return err
  }
}
  
export const updateBenefitRuleById = async (id: string, benefit: any) =>
  await BenefitRule.update({ id, ...benefit }, { returning: true })
    .then((updatedBenefit: any) => updatedBenefit)
    .catch((err: any) => err);

export const searchBenefitRule = async (query: any) => {
  try {
    const { benefit, benefitAmount, benefitId } = query;
    const { like, or } = Op;

    const search = {
      where: {
        [or]: [
          {
            benefitId: { [like]: `%${benefitId}%`}
          },
          {
            benefit: { [like]: `%${benefit}%` },
          },
          sequelize.where(
            sequelize.cast(sequelize.col("benefitAmount"), "varchar"),
            { [like]: `%${benefitAmount}%` },
          ),
        ],
      },
    };

    const foundBenefits = await BenefitRule.findAll(search);

    return foundBenefits;
  } catch (err) {
    return err;
  }
};

// export {
//   getAllBenefits,
//   getBenefitById,
//   getBenefitByBenefitId,
//   createBenefit,
//   updateBenefitById,
//   getAllChildBenefits,
//   getChildBenefitById,
//   createChildBenefit,
//   updateChildBenefitById,
//   getAllFamilyBenefits,
//   getFamilyBenefitById,
//   createFamilyBenefit,
//   updateFamilyBenefitById,
//   getAllBenefitRules,
//   getBenefitRuleById,
//   getBenefitRuleByBenefitId,
//   createBenefitRule,
//   updateBenefitRuleById,
//   searchBenefitRule
// };
