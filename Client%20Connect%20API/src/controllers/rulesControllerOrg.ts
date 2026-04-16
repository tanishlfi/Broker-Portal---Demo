import { TableHints } from "sequelize";
import {
  getAllMemberBenefitRules,
  getMemberBenefitRuleById,
  getBenefitByBenefitId,
  createBenefit,
  updateBenefitById,
  getAllChildBenefits,
  getChildBenefitById,
  createChildBenefit,
  updateChildBenefitById,
  getAllFamilyBenefits,
  getFamilyBenefitById,
  createFamilyBenefit,
  updateFamilyBenefitById,
  getAllBenefitRules,
  getBenefitRuleById,
  getBenefitRuleByBenefitId,
  createBenefitRule,
  updateBenefitRuleById,
  searchBenefitRule,
} from "../handlers/rulesHandler";

import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { rmaAPI } from "../utils/rmaAPI";
const {
  BenefitRule,
  ProductOptionBenefit,
  DependantBenefitRule,
  productOption,
  benefit,
  sequelize,
} = require("../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");

import { Request, Response } from "express";
import cache from "../utils/cache";

// controller to get benefit amount based on product option id
export const getBenefitAmountByProductOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // get product option id from params
    const { productOptionId } = req.params;

    const benefits = await benefit.findAll({
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
    if (benefits.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No benefits amounts found",
      });
    }

    // create an array of unique benefit amounts
    const benefitArray = benefits.map((benefit: any) => {
      return benefit.benefitAmount;
    });

    return res.status(200).json({
      success: true,
      message: "Found the following benefits",
      data: benefitArray,
    });
  } catch (err) {
    return err;
  }
};

export const getOptionsByProductOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { productOptionId } = req.params;

    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is required",
      });
    }

    // if productOptionId is not a number then return error
    if (isNaN(Number(productOptionId))) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is invalid",
      });
    }

    // get benefit amounts
    const benefits = await sequelize.query(
      `SELECT  DISTINCT([benefitAmount]) AS [benefitAmount] FROM [rules].[BenefitRules] (nolock) AS [BenefitRule] INNER JOIN [rules].[ProductOptionBenefits] (nolock)  AS [ProductOptionBenefits] ON [BenefitRule].[benefitId] = [ProductOptionBenefits].[benefitId] AND [ProductOptionBenefits].[productOptionId] = ${productOptionId};`,
      { type: QueryTypes.SELECT },
    );

    if (benefits.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No cover levels found",
      });
    }

    const benefitArray = benefits.map((benefit: any) => {
      return benefit.benefitAmount;
    });

    // get category options
    let categoryOpt: any = [
      {
        categoryId: 1,
        categoryName: "Main Member Only",
      },
    ];

    const categoryOptions = await sequelize.query(
      `select distinct case when a.coverMemberType = 'Spouse' then 2 when a.coverMemberType = 'Child' then 3 when a.coverMemberType = 'Extended Family' then 4 else 0 end as coverMemberTypeId from rules.DependantBenefitRules (nolock) as a inner join rules.productOptions (nolock) as b on a.id = b.benefitId and b.productOptionId = ${productOptionId};`,
      { type: QueryTypes.SELECT },
    );

    // if no category options found loop through the benefits and add the category options to categoryOpt
    // if coverMemberTypeId === 2 or 3 then { categoryId: 2, categoryName: "Main Member + Family" }
    // if coverMemberTypeId === 4 then { categoryId: 3, categoryName: "Main Member, Family + Extended" }
    // only add once the category option if it is not already in the categoryOpt
    if (categoryOptions.length > 0) {
      categoryOptions.forEach((category: any) => {
        if (
          category.coverMemberTypeId === 2 ||
          category.coverMemberTypeId === 3
        ) {
          if (!categoryOpt.some((e: any) => e.categoryId === 2)) {
            categoryOpt.push({
              categoryId: 2,
              categoryName: "Main Member + Family",
            });
          }
        }

        if (category.coverMemberTypeId === 4) {
          if (!categoryOpt.some((e: any) => e.categoryId === 3)) {
            categoryOpt.push({
              categoryId: 3,
              categoryName: "Main Member, Family + Extended",
            });
          }
        }
      });
    }

    const benefitOptions = {
      productOptionId: productOptionId,
      categoryOptions: categoryOpt.sort(
        (a: any, b: any) => a.categoryId - b.categoryId,
      ),
      coverLevels: benefitArray.sort((a: any, b: any) => a - b),
    };

    return res.status(200).json({
      success: true,
      message: "Found the following benefitOptions",
      data: benefitOptions,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

// function that gets all member benefits based on product option id called benefitsByProductionOptionId
export const BenefitsByProductionOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { productOptionId } = req.params;

    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is required",
      });
    }

    // if productOptionId is not a number then return error
    if (isNaN(Number(productOptionId))) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is invalid",
      });
    }

    // get benefit amounts
    const benefits = await sequelize.query(
      `select distinct a.benefitId, a.benefitAmount, a.benefit, a.coverMemberTypeId, a.spouse, a.children, a.baseRate, a.benefitAmount as coverAmount 
      from rules.BenefitRules (nolock) as a
      inner join rules.productOptions (nolock) as b on a.benefitId = b.benefitId and b.productOptionId = ${productOptionId}
      union
      select distinct a.id, a.benefitAmount, a.benefit, case when a.coverMemberType = 'Spouse' then 2 when a.coverMemberType = 'Child' then 3 when a.coverMemberType = 'Extended Family' then 4 else 0 end as  coverMemberTypeId, null,null,a.baseRate, a.coverAmount
      from rules.DependantBenefitRules (nolock) as a
      inner join rules.productOptions (nolock) as b on a.id = b.benefitId and b.productOptionId = ${productOptionId};`,
      { type: QueryTypes.SELECT },
    );

    if (benefits.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No cover levels found",
      });
    }

    // return the result
    return res.status(200).json({
      success: true,
      message: "Found the following benefits",
      data: benefits,
    });
  } catch (err: any) {
    // catch any errors
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllMemberBenefitRulesController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { selectedCategory } = req.params;

    if (selectedCategory && !["1", "2", "3"].includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Category is invalid",
      });
    }

    let whereCondition: object = {};

    if (selectedCategory === "1") {
      whereCondition = {
        spouse: 0,
        children: 0,
        familyMembers: 0,
      };
    }

    if (selectedCategory === "2") {
      whereCondition = {
        spouse: 1,
        children: { [Op.gt]: 0 },
        familyMembers: 0,
      };
    }

    if (selectedCategory === "3") {
      whereCondition = {
        spouse: 1,
        children: { [Op.gt]: 0 },
        familyMembers: { [Op.gt]: 0 },
      };
    }

    // console.log(benefits);

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
        [
          Sequelize.literal(
            `(CASE WHEN spouse = 0 and children = 0 and "familyMembers" = 0 THEN 1 WHEN spouse > 0 and children > 0 and "familyMembers" = 0 THEN 2 ELSE 3 END)`,
          ),
          "categoryId",
        ],
        [
          Sequelize.literal(
            `(CASE WHEN spouse = 0 and children = 0 and "familyMembers" = 0 THEN 'Main Member Only' WHEN spouse > 0 and children > 0 and "familyMembers" = 0 THEN 'Main Member + Family' ELSE 'Main Member, Family + Extended' END)`,
          ),
          "category",
        ],
        // "ProductOptionBenefits.productOptionId",
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
      order: [
        ["productOptionId", "ASC"],
        ["categoryId", "ASC"],
      ],
      include: [
        {
          model: ProductOptionBenefit,
          required: true,
          attributes: ["productOptionId"],
        },
      ],
    });

    const benefitAmount = await BenefitRule.findAll({
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
        "benefitAmount",
      ],
      distinct: "ProductOptionBenefits.productOptionId",
      order: [["productOptionId", "ASC"]],
      include: [
        {
          model: ProductOptionBenefit,
          required: true,
          attributes: ["productOptionId"],
        },
      ],
    });

    // map through the benefits and add the benefitAmount to each benefit
    const benefitAmountArray = benefits.map((benefit: any) => {
      let foundBenefitAmount: any = [];
      // append all found benefitAmounts to the benefit
      benefitAmount.forEach((benefitAmount: any) => {
        if (benefitAmount.productOptionId === benefit.productOptionId) {
          foundBenefitAmount.push(benefitAmount.benefitAmount);
        }
      });
      // order benefitAmount
      foundBenefitAmount = foundBenefitAmount.sort((a: any, b: any) => a - b);
      // return the benefit with the benefitAmount

      return { ...benefit, benefitAmount: foundBenefitAmount };
    });

    return res.status(200).json({
      success: true,
      message: "Found the following member benefit rules",
      data: benefitAmountArray,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllMemberBenefitRulesByProductOptionController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { productOptionId, selectedCategory } = req.params;

    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is required",
      });
    }

    if (selectedCategory && !["1", "2", "3"].includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Category is invalid",
      });
    }

    let whereCondition: object = {};

    if (selectedCategory === "1") {
      whereCondition = {
        ...whereCondition,
        spouse: 0,
        children: 0,
        familyMembers: 0,
      };
    }

    if (selectedCategory === "2") {
      whereCondition = {
        ...whereCondition,
        spouse: 1,
        children: { [Op.gt]: 0 },
        familyMembers: 0,
      };
    }

    if (selectedCategory === "3") {
      whereCondition = {
        ...whereCondition,
        spouse: 1,
        children: { [Op.gt]: 0 },
        familyMembers: { [Op.gt]: 0 },
      };
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
        [
          Sequelize.literal(
            `(CASE
              WHEN spouse = 0
              and children = 0
              and "familyMembers" = 0 THEN 1
              WHEN spouse > 0
              and children > 0
              and "familyMembers" = 0 THEN 2
              WHEN spouse > 0
              and children = 0
              and "familyMembers" = 0 THEN 4
              WHEN spouse = 0
              and children > 0
              and "familyMembers" = 0 THEN 5
              ELSE 3
            END)`,
          ),
          "categoryId",
        ],
        [
          Sequelize.literal(
            `(CASE
              WHEN spouse = 0
              and children = 0
              and "familyMembers" = 0 THEN 'Main Member Only'
              WHEN spouse > 0
              and children > 0
              and "familyMembers" = 0 THEN 'Main Member + Family'
              WHEN spouse > 0
              and children = 0
              and "familyMembers" = 0 THEN 'Main Member + Spouse'
              WHEN spouse = 0
              and children > 0
              and "familyMembers" = 0 THEN 'Main Member + Children'
              ELSE 'Main Member, Family + Extended'
            END)`,
          ),
          "category",
        ],
        // "ProductOptionBenefits.productOptionId",
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
      order: [
        ["productOptionId", "ASC"],
        ["categoryId", "ASC"],
      ],
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

    const benefitAmount = await BenefitRule.findAll({
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

    const benefitAmountArray = benefitAmount
      ? benefitAmount.map((benefit: any) => {
          return benefit.benefitAmount;
        })
      : [];

    const benefitsArray = benefits.map((benefit: any) => {
      benefit.benefitAmount = benefitAmountArray;
      return benefit;
    });

    return res.status(200).json({
      success: true,
      message: "Found the following member benefit rules",
      data: benefitsArray,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getBenefitsByProductionOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { productOptionId } = req.params;
    const { mainBenefitId, coverAmount, selectedCategory } = req.query;

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

    if (selectedCategory) {
      if (!["1", "2", "3"].includes(String(selectedCategory))) {
        return res.status(400).json({
          success: false,
          message: "Category is invalid",
        });
      }

      if (selectedCategory === "1") {
        whereCondition = {
          ...whereCondition,
          spouse: 0,
          children: 0,
          familyMembers: 0,
        };
      }

      if (selectedCategory === "2") {
        whereCondition = {
          ...whereCondition,
          spouse: 1,
          children: { [Op.gt]: 0 },
          familyMembers: 0,
        };
      }

      if (selectedCategory === "3") {
        whereCondition = {
          ...whereCondition,
          spouse: 1,
          children: { [Op.gt]: 0 },
          familyMembers: { [Op.gt]: 0 },
        };
      }
    }

    // console.log("whereCondition", whereCondition);

    const benefits = await BenefitRule.findAll({
      where: whereCondition,
      include: [
        {
          model: ProductOptionBenefit,
          required: true,
          attributes: ["productOptionId"],
          where: {
            productOptionId: productOptionId,
          },
        },
        {
          model: DependantBenefitRule,
          required: false,
          attributes: [
            "id",
            "benefit",
            "minAge",
            "maxAge",
            "benefitAmount",
            "coverMemberType",
            "subGroup",
            "baseRate",
          ],
        },
      ],
      // order by DependantBenefitRule.id
      order: [[DependantBenefitRule, "id", "ASC"]],
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

export const getAllMemberBenefitRulesByBenefitIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { benefitId } = req.params;

    if (!benefitId) {
      return res.status(400).json({
        success: false,
        message: "Benefit id is required",
      });
    }

    // const getProductOptionId = await BenefitRule.findOne({
    //   where: {
    //     benefitId: benefitId,
    //   },
    //   attributes: ["productOptionId"],
    // });

    // let whereCondition: object = {
    //   productOptionId: getProductOptionId.dataValues.productOptionId,
    // };

    let whereCondition: object = {
      benefitId: benefitId,
    };

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
        [
          Sequelize.literal(
            `(CASE WHEN spouse = 0 and children = 0 and "familyMembers" = 0 THEN 1 WHEN spouse > 0 and children > 0 and "familyMembers" = 0 THEN 2 ELSE 3 END)`,
          ),
          "categoryId",
        ],
        [
          Sequelize.literal(
            `(CASE WHEN spouse = 0 and children = 0 and "familyMembers" = 0 THEN 'Main Member Only' WHEN spouse > 0 and children > 0 and "familyMembers" = 0 THEN 'Main Member + Family' ELSE 'Main Member, Family + Extended' END)`,
          ),
          "category",
        ],
        // "productOptionId",
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
      distinct: "productOptionId",
      order: [
        ["productOptionId", "ASC"],
        ["categoryId", "ASC"],
      ],
      include: [
        {
          model: ProductOptionBenefit,
          required: true,
          attributes: ["productOptionId"],
        },
      ],
    });

    const benefitAmount = await BenefitRule.findAll({
      where: whereCondition,
      attributes: [
        Sequelize.fn("DISTINCT", Sequelize.col("benefitAmount")),
        "benefitAmount",
      ],
      distinct: "benefitAmount",
    });

    const benefitAmountArray = benefitAmount
      ? benefitAmount.map((benefit: any) => {
          return benefit.benefitAmount;
        })
      : [];

    const benefitsArray = benefits.map((benefit: any) => {
      benefit.benefitAmount = benefitAmountArray;
      benefit.benefitId = benefitId;
      return benefit;
    });

    res.status(200).json({
      success: true,
      data: benefitsArray,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getMemberBenefitRuleByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const foundBenefit = await getMemberBenefitRuleById(id);

    res.status(200).json({
      success: true,
      message: "Found the following member benefit rule",
      data: foundBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Found the following member benefit rule",
      err,
    });
  }
};

export const getBenefitByBenefitIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { benefitId } = req.params;

    const foundBenefit = await getBenefitByBenefitId(benefitId);

    res.status(200).json({
      success: true,
      message: "Found the following benefits",
      data: foundBenefit,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const createBenefitController = async (req: Request, res: Response) => {
  try {
    const createdBenefit = await createBenefit(req.body);
    console.log(createBenefit);
    res.status(200).json({
      success: true,
      message: "Created the following benefit",
      data: createdBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to create a benefit",
      err,
    });
  }
};

export const updateBenefitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedBenefit = await updateBenefitById(id, req.body);

    res.status(201).json({
      success: true,
      message: "Found the following benefits",
      data: updatedBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to update benefit",
      err,
    });
  }
};

/**
 * CHILD BENEFITS
 */

export const getAllChildBenefitsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const childBenefits = await getAllChildBenefits();

    res.status(200).json({
      success: true,
      message: "Found the following benefits",
      data: childBenefits,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const getChildBenefitByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const foundBenefit = await getChildBenefitById(id);

    res.status(200).json({
      success: true,
      message: "Found the following child benefit",
      data: foundBenefit,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const createChildBenefitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const createdBenefit = await createChildBenefit(req.body);

    res.status(200).json({
      success: true,
      message: "Created the following benefit",
      data: createdBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to create a benefit",
      err,
    });
  }
};

export const updateChildBenefitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const updatedBenefit = await updateChildBenefitById(id, req.body);

    res.status(201).json({
      success: true,
      message: "Found the following benefits",
      data: updatedBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to update benefit",
      err,
    });
  }
};

/**
 * FAMILY BENEFITS
 */

export const getAllFamilyBenefitsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const childBenefits = await getAllFamilyBenefits();

    res.status(200).json({
      success: true,
      message: "Found the following benefits",
      data: childBenefits,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const getFamilyBenefitByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const foundBenefit = await getFamilyBenefitById(id);

    res.status(200).json({
      success: true,
      message: "Found the following benefits",
      data: foundBenefit,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const createFamilyBenefitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const createdBenefit = await createFamilyBenefit(req.body);

    res.status(200).json({
      success: true,
      message: "Created the following benefit",
      data: createdBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to create a benefit",
      err,
    });
  }
};

export const updateFamilyBenefitController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const updatedBenefit = await updateFamilyBenefitById(id, req.body);

    res.status(201).json({
      success: true,
      message: "Found the following benefits",
      data: updatedBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to update benefit",
      err,
    });
  }
};

/**
 * BENEFIT RULES
 */

export const getAllBenefitRulesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const childBenefits = await getAllBenefitRules();

    res.status(200).json(childBenefits);
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const getBenefitRuleByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const foundBenefit = await getBenefitRuleById(id);

    res.status(200).json(foundBenefit);
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const getBenefitRuleByBenefitIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { benefitId } = req.params;

    const foundBenefit = await getBenefitRuleByBenefitId(benefitId);

    res.status(200).json(foundBenefit);
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Unable to find any benefits", err });
  }
};

export const searchBenefitRuleController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { query } = req;
    const searched = await searchBenefitRule(query);

    res.status(200).json({
      success: true,
      message: "Search results",
      data: searched,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Found the following benefits",
      err,
    });
  }
};

export const createBenefitRuleController = async (
  req: Request,
  res: Response,
) => {
  try {
    const createdBenefit = await createBenefitRule(req.body);

    res.status(200).json(createdBenefit);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to create a benefit",
      err,
    });
  }
};

export const updateBenefitRuleController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const updatedBenefit = await updateBenefitRuleById(id, req.body);

    res.status(201).json({
      success: true,
      message: "Found the following benefits",
      data: updatedBenefit,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred, Unable to update benefit",
      err,
    });
  }
};

export const getRMABenefitsByProductOptionIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    // require productOptionId in params
    const { productOptionId, benefitAmount } = req.params;

    if (!productOptionId) {
      return res.status(400).json({
        success: false,
        message: "Product Option id is required",
      });
    }

    if (benefitAmount && isNaN(Number(benefitAmount))) {
      return res.status(400).json({
        success: false,
        message: "Benefit amount is invalid",
      });
    }

    const cacheKey = benefitAmount
      ? `${productOptionId}-${benefitAmount}`
      : productOptionId;

    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: "Found the following member benefits",
        data: cachedData,
      });
    }

    // need to change to this once benefit update api is updated
    // const getBenefits = await benefit.findAll({
    //   include: [
    //     {
    //       model: productOption,
    //     },
    //   ],
    // });

    let getBenefits: any = [];
    let mainMemberConfirm: boolean = false;

    // get all dependant benefits

    for (let i = 1; i < 6; i++) {
      const benefitsAPI = await rmaAPI(
        `clc/api/Product/Benefit/GetProductBenefitRates/${productOptionId}/${i}`,
        req.app.get("rmaAccessToken"),
      );
      if (!benefitsAPI?.data?.benefits) {
        continue;
      }
      benefitsAPI?.data?.benefits.map((benefit: any) => {
        if (benefit.coverMemberType === 3) {
          // console.log("benefit", benefit);
          // case if name includes 55K then enefit.benefitRates[0]?.benefitAmount 55000 case 50K then 50000 case 45K then 45000
          if (benefit.name.includes("55K")) {
            benefit.benefitRates[0].benefitAmount = 55000;
          } else if (benefit.name.includes("50K")) {
            benefit.benefitRates[0].benefitAmount = 50000;
          } else if (benefit.name.includes("45K")) {
            benefit.benefitRates[0].benefitAmount = 45000;
          } else if (benefit.name.includes("40K")) {
            benefit.benefitRates[0].benefitAmount = 40000;
          } else if (benefit.name.includes("35K")) {
            benefit.benefitRates[0].benefitAmount = 35000;
          } else if (benefit.name.includes("30K")) {
            benefit.benefitRates[0].benefitAmount = 30000;
          } else if (benefit.name.includes("25K")) {
            benefit.benefitRates[0].benefitAmount = 25000;
          } else if (benefit.name.includes("20K")) {
            benefit.benefitRates[0].benefitAmount = 20000;
          } else if (benefit.name.includes("18K")) {
            benefit.benefitRates[0].benefitAmount = 18000;
          } else if (benefit.name.includes("15K")) {
            benefit.benefitRates[0].benefitAmount = 15000;
          } else if (benefit.name.includes("10K")) {
            benefit.benefitRates[0].benefitAmount = 10000;
          } else if (benefit.name.includes("7.5K")) {
            benefit.benefitRates[0].benefitAmount = 7500;
          } else if (benefit.name.includes("5K")) {
            benefit.benefitRates[0].benefitAmount = 5000;
          }
        }

        if (
          benefitAmount &&
          benefit.benefitRates[0]?.benefitAmount === Number(benefitAmount)
        ) {
          if (!mainMemberConfirm && benefit.coverMemberType === 1) {
            mainMemberConfirm = true;
          }
          getBenefits.push({
            benefitId: benefit.id,
            benefit: benefit.name,
            coverMemberType: benefit.coverMemberType,
            benefitAmount: benefit.benefitRates[0]?.benefitAmount,
            baseRate: benefit.benefitRates[0]?.baseRate,
          });
        } else if (
          benefitAmount &&
          benefit.coverMemberType === 4 &&
          benefit.benefitRates[0]?.benefitAmount < Number(benefitAmount)
        ) {
          if (
            !benefit.name.includes("parent") &&
            !benefit.name.includes("other")
          ) {
            getBenefits.push({
              benefitId: benefit.id,
              benefit: benefit.name,
              coverMemberType: benefit.coverMemberType,
              benefitAmount: benefit.benefitRates[0]?.benefitAmount,
              baseRate: benefit.benefitRates[0]?.baseRate,
            });
          }
        } else {
          if (!mainMemberConfirm && benefit.coverMemberType === 1) {
            mainMemberConfirm = true;
          }
          getBenefits.push({
            benefitId: benefit.id,
            benefit: benefit.name,
            coverMemberType: benefit.coverMemberType,
            benefitAmount: benefit.benefitRates[0]?.benefitAmount,
            baseRate: benefit.benefitRates[0]?.baseRate,
          });
        }
      });
    }

    if (getBenefits.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No benefits found",
      });
    }
    // console.log(getBenefits);

    if (!mainMemberConfirm) {
      return res.status(200).json({
        success: false,
        message: "No benefits found",
      });
    }

    const expiryTime = 300;

    cache.set(cacheKey, getBenefits, expiryTime);

    return res.status(200).json({
      success: true,
      message: "Found the following member benefits",
      data: getBenefits,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};
