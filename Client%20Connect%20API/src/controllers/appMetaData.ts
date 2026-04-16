import { ManagementClient } from "auth0";
import { Request, Response } from "express";
const { user_meta_data } = require("../models");
const AUTH0_BACKEND_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_BACKEND_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || "";

var management = new ManagementClient({
  domain: "cdasol.eu.auth0.com",
  clientId: AUTH0_BACKEND_CLIENT_ID,
  clientSecret: AUTH0_BACKEND_CLIENT_SECRET,
});

export const createUserMetaData = async (req: Request, res: Response) => {
  try {
    const createdUserMetaData = await user_meta_data.upsert({
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: "User meta data created successfully",
      data: createdUserMetaData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const getUserMetaData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userMetaData = await user_meta_data.findOne({
      where: { user_id: id },
    });

    if (!userMetaData) {
      return res.status(204).json({
        success: true,
        message: "User has no Meta Data",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User meta data",
      data: userMetaData,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred unable to find user meta data",
      err,
    });
  }
};

export const updateUserMetaData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userMetaData = await user_meta_data.findOne({
      where: { user_id: id },
    });

    if (!userMetaData) {
      return res.status(400).json({
        success: false,
        message: "Unable to find user meta data",
      });
    }

    const updatedUserMetaData = await user_meta_data.update(
      {
        ...req.body,
      },
      { where: { user_id: id } },
    );

    return res.status(200).json({
      success: true,
      message: "User meta data updated successfully",
      data: updatedUserMetaData,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error occurred unable to update user meta data",
      err,
    });
  }
};
