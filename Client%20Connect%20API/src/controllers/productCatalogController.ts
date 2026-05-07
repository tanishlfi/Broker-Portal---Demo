import { Request, Response } from "express";
const { BrokerProduct, BrokerBenefit } = require("../models");
import { PricingService } from "../services/pricingService";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";

export const getProductListController = async (req: Request, res: Response) => {
  try {
    const productList = await BrokerProduct.findAll({
      where: { is_active: true },
      include: [
        {
          model: BrokerBenefit,
          as: "benefits",
        },
      ],
    });

    const formattedList = productList.map((product: any) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      description: product.description,
      benefits: product.benefits.map((benefit: any) => ({
        benefit_id: benefit.benefit_id,
        benefit_name: benefit.benefit_name,
        benefit_type: benefit.benefit_type,
        is_mandatory: benefit.is_mandatory,
        is_embedded: benefit.is_embedded,
        default_cover_amount: benefit.default_cover_amount,
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Broker Portal product list retrieved successfully",
      data: formattedList,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const calculatePricingController = async (req: Request, res: Response) => {
  try {
    const pricingResult = await PricingService.calculateQuotePricing(req.body);

    return res.status(200).json({
      success: true,
      message: "Pricing calculated successfully",
      data: pricingResult,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
