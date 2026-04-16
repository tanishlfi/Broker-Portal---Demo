import { Request, Response, NextFunction } from "express";
import { jwtDecode } from "jwt-decode";
import { logger } from "./logger";

export const confirmToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.header("authorization");
    if (!header) {
      return res.status(401).json({
        success: false,
        message: "User not authorized to make request to this API HEADER",
      });
    }

    const split = header.split(" ");

    if (split[0] !== "Bearer" || !split[1]) {
      return res.status(401).json({
        success: false,
        message: "User not authorized to make request to this API Bearer",
      });
    }

    const token: any = jwtDecode(split[1]);

    const tokenExpiry: number =
      token.exp - Math.round(new Date().getTime() / 1000) - 120;

    // check token expiry
    if (tokenExpiry <= 0) {
      return res.status(401).json({
        success: false,
        message: "User not authorized to make request to this API EXPIRED",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "User not authorized to make request to this API CATCH",
    });
  }
};
