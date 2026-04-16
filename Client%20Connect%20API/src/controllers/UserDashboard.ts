// dashboardController.ts

import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
const {
  File,
  onboardingPolicy,
  // ... other models
} = require("../models");

export const getUserDashboard = async (req: Request, res: Response) => {
  try {
    const currentUser = String(req?.auth?.payload?.user);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    const wherePoliciesInError = {
      createdBy: currentUser,
      status: "Error",
    };

    const policiesInErrorCount = await onboardingPolicy.count({
      where: wherePoliciesInError,
    });

    const whereFileInError = {
      createdBy: currentUser,
      status: "Error",
    };
    const fileErrorCount = await File.count({
      where: whereFileInError,
    });

    const wherePolicyApprovals = {
      approverId: currentUser,
      status: "Submitted",
      fileId: null,
    };

    const policiesApprovalsCount = await onboardingPolicy.count({
      where: wherePolicyApprovals,
    });

    // --- CONSTRUCT RESPONSE ---
    const dashboardData = {
      policiesInErrorCount: policiesInErrorCount,
      fileErrorCount: fileErrorCount,
      policiesForApprovalCount: policiesApprovalsCount, // Renamed for clarity
    };

    return res.status(200).json({
      success: true,
      message: "User dashboard stats retrieved successfully.",
      data: dashboardData,
    });
  } catch (err: any) {
    console.error("Error fetching user dashboard stats:", err);
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};
