import axios from "axios";
import { logger } from "../middleware/logger";
import { ResponseDataObj } from "../interfaces/astute";
import cache from "../utils/cache";

const rmaVOPDErrorIncrement = async () => {
  let rmaVOPDError: number = 1;
  if (cache.has("rmaVOPDError")) {
    rmaVOPDError = Number(cache.get("rmaVOPDError"));
    rmaVOPDError += 1;
    cache.set("rmaVOPDError", rmaVOPDError, 900);
  } else {
    cache.set("rmaVOPDError", rmaVOPDError, 900);
  }
};

const rmaVOPDErrorDecrement = async () => {
  if (cache.has("rmaVOPDError")) {
    let rmaVOPDError: number = Number(cache.get("rmaVOPDError"));
    if (rmaVOPDError > 0) {
      rmaVOPDError -= 1;
      cache.set("rmaVOPDError", rmaVOPDError, 900);
    } else {
      cache.del("rmaVOPDError");
    }
  }
};

export const rmaVOPDErrorCount = async () => {
  if (cache.has("rmaVOPDError")) {
    let diff = Math.abs(Number(cache.getTtl("rmaVOPDError")) - Date.now());
    return {
      count: Number(cache.get("rmaVOPDError")),
      minutes: Math.floor(diff / 1000 / 60),
    };
  }
  return {
    count: 0,
    minutes: 0,
  };
};

export const RMAQuickTransact = async (
  idNumber: string,
  requestType: string = "death-verification",
) => {
  try {
    let requestBody: Object = {
      homeAffairsDeathVerification: {
        idReferenceNo: idNumber,
      },
    };
    // request
    const config = {
      method: "post",
      url: `${process.env.RMA_VOPD_URL}/home-affairs/quick/${requestType}`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.RMA_VOPD_KEY,
      },
      data: requestBody,
      timeout: 90000,
    };

    const response = await axios(config);

    let rmaResponseData: ResponseDataObj = response.data.VerificationResponse;

    if (rmaResponseData.VerificationDetails.length === 0) {
      logger.error(`Unable to process ID number: ${idNumber}`);
      logger.error(JSON.stringify(rmaResponseData));
      rmaVOPDErrorIncrement();
      return { result: false, error: "No response data" };
    }

    // object containing data and response.data
    const return_object = {
      fullResponse: rmaResponseData,
      astuteResponse: rmaResponseData.VerificationDetails[0] || null,
      org_request: requestBody,
    };
    rmaVOPDErrorDecrement();
    return { result: true, data: return_object };
  } catch (error) {
    rmaVOPDErrorIncrement();
    logger.error(`RMA VOPD Callback error ${error}`);
    return { result: false, error: error };
  }
};
