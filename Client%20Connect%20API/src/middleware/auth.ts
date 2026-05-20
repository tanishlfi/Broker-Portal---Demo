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
      token.exp - Math.round(new Date().getTime() / 1000) - 30;

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

export const requireBrokerRep = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as any;
    let rmaAppRoles = Array.isArray(authReq?.auth?.payload?.rmaAppRoles)
      ? authReq?.auth?.payload?.rmaAppRoles
      : [];

    // Fallback: decode directly from header if rmaAppRoles is not populated
    if (rmaAppRoles.length === 0) {
      const header = req.header("authorization");
      if (header) {
        const split = header.split(" ");
        if (split[1]) {
          const decoded: any = jwtDecode(split[1]);
          const extractedRoles = decoded?.rmaAppRoles || decoded?.roles || decoded?.role || [];
          rmaAppRoles = Array.isArray(extractedRoles) ? extractedRoles : [extractedRoles];
        }
      }
    }

    if (!rmaAppRoles.includes("BP_BROKER_REP")) {
      return res.status(403).json({
        success: false,
        message: "User not authorized to make request to this API: Missing BP_BROKER_REP role",
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "User not authorized to make request to this API: Role verification failed",
    });
  }
};
