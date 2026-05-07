import qs from "qs";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import cache from "../utils/cache";
import { logger } from "./logger";

export const getRmaAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // check if token exists in cache
    if (cache.has("rmaAccessToken")) {
      logger.debug("RMA Token is in cache");

      // return token from cache
      req.app.set("rmaAccessToken", cache.get("rmaAccessToken"));
      return next();
    }

    logger.debug("RMA Token is NOT in cache");

    const token = await axios.post(
      `${process.env.RMA_AUTH_URL}`,
      qs.stringify({
        client_id: process.env.RMA_CLIENT_ID,
        client_secret: process.env.RMA_CLIENT_SECRET,
        grant_type: process.env.RMA_GRANT_TYPE,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    req.app.set("rmaAccessToken", token.data.access_token);

    // console log the bearer token being sent
    if (process.env.NODE_ENV === "development") {
      logger.debug(`RMA Bearer token ${token.data.access_token}`);
      console.log("RMA Bearer token", token.data.access_token);
    }

    // set token in cache for 90% of expiry time
    const expiryTime = token.data.expires_in * 0.9;
    cache.set("rmaAccessToken", token.data.access_token, expiryTime);
    logger.debug(
      `RMA Token set in cache expiring in ${expiryTime} seconds or ${
        expiryTime / 60
      } minutes`,
    );

    next();
  } catch (err) {
    console.log(`Error on ${err}`);
    return res.status(401).json({
      success: false,
      error: err,
      message:
        "GET RMA Token = User not authorized to make request to this API",
    });
  }
};
