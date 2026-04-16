import { Request, Response } from "express";
const { sequelize } = require("../models");

// health endpoint that does a database query to confirm db available
export const health = async (req: Request, res: Response) => {
  try {
    // get sql database date
    const [results] = await sequelize.query("SELECT GETDATE() [current_time]", {
      type: sequelize.QueryTypes.SELECT,
    });
    console.log("Health check successful:", results);

    return res.status(200).json({
      status: "ok",
      message: "API is healthy",
      currentTime: results.current_time,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return res.status(500).json({
      status: "error",
      message: "API is not healthy",
      error: error.message,
    });
  }
};
