import { Request, Response } from "express";
import { calculatePremium } from "../utils/premiumCalculator";
const { sequelize } = require("../models");

// @description: Calculate premium
// @route: POST /premiumCalculator
// @access: Public
// body: {
//   benefitRate: number,
//   premiumAdjustmentPercentage: number,
//   adminFeePercentage: number,
//   commissionPercentage: number,
//   binderFeePercentage: number,
// }
// returns: {
//   success: boolean,
//   message: string,
//   data: number
// }
export const calculatePremiumController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      benefitRate,
      // premiumAdjustmentPercentage,
      adminFeePercentage,
      commissionPercentage,
      binderFeePercentage,
    } = req.body;
    const premium = await calculatePremium(
      sequelize,
      benefitRate,
      // premiumAdjustmentPercentage,
      adminFeePercentage,
      commissionPercentage,
      binderFeePercentage,
    );
    return res.status(200).json({
      success: true,
      message: "Premium calculated successfully",
      data: parseFloat(premium.toFixed(4)),
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
    console.error("Error calculating premium:", err);
  }
};
