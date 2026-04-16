import axios from "axios";
import { logger } from "../middleware/logger";
import { ResponseDataObj } from "../interfaces/astute";
import cache from "../utils/cache";

const astuteErrorIncrement = async () => {
  let astuteError: number = 1;
  if (cache.has("astuteError")) {
    astuteError = Number(cache.get("astuteError"));
    astuteError += 1;
    cache.set("astuteError", astuteError, 900);
  } else {
    cache.set("astuteError", astuteError, 900);
  }
};

const astuteErrorDecrement = async () => {
  if (cache.has("astuteError")) {
    let astuteError: number = Number(cache.get("astuteError"));
    if (astuteError > 0) {
      astuteError -= 1;
      cache.set("astuteError", astuteError, 900);
    } else {
      cache.del("astuteError");
    }
  }
};

export const AstuteErrorCount = async () => {
  if (cache.has("astuteError")) {
    let diff = Math.abs(Number(cache.getTtl("astuteError")) - Date.now());
    return {
      count: Number(cache.get("astuteError")),
      minutes: Math.floor(diff / 1000 / 60),
    };
  }
  return {
    count: 0,
    minutes: 0,
  };
};

const getAstuteToken = async (client_id: string, client_secret: string) => {
  try {
    // const mykeys = cache.keys();
    // console.log(`heys ${mykeys}`);

    // check if token exists in cache
    if (cache.has("astuteToken")) {
      logger.debug("Token is in cache");
      // console.log(cache.get("astuteToken"));
      // return token from cache
      return {
        result: true,
        data: Object(cache.get("astuteToken")).access_token,
      };
    }

    // set scope
    const scope: String = `https://astutefseb2c.onmicrosoft.com/${client_id}/.default`;
    // set grant type
    const grant_type: String = "client_credentials";
    // object containing all relevant vars
    const data = {
      client_id: client_id,
      client_secret: client_secret,
      scope: scope,
      grant_type: grant_type,
    };

    // set axios config
    const config = {
      method: "post",
      url: "https://login.microsoftonline.com/astutefseb2c.onmicrosoft.com/oauth2/v2.0/token?grant_type=client_credentials",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
      timeout: 90000,
    };

    // get token
    const response = await axios(config);

    // set token in cache for 50 minutes
    cache.set("astuteToken", response.data, 3000);
    astuteErrorDecrement();
    // return object containing result and token
    return { result: true, data: response.data.access_token };
  } catch (error) {
    cache.set("astuteError", 11, 900);
    logger.error(`Astute token error ${error}`);
    return { result: false };
  }
};

export const AstuteQuickTransact = async (
  idNumber: string,
  TransRefGuid: string,
  client_id: string,
  client_secret: string,
  basic_auth: string,
  subscriptionKey: string,
  url_route: string,
) => {
  try {
    // get astute token
    const astuteToken = await getAstuteToken(client_id, client_secret);

    if (!astuteToken.result) {
      return { result: false };
    }
    // VopdVerificationType
    // 1 Identity
    // 2 Death
    // 3 Status
    // 4 Birth
    // 5 Lineage
    // 6 Marriage
    // 8 Comprehensive
    // object containing all relevant vars
    const data = {
      TransRefGuid: TransRefGuid,
      TrackingReference: "3",
      VopdRequestDetails: [
        {
          VopdVerificationType: 2,
          MessageId: "string",
          VopdIdType: 4,
          IdReferenceNo: idNumber,
        },
      ],
    };

    // set axios config
    // set timeout to 5000 if you want to test callback
    const config = {
      method: "post",
      url: `https://api.astutefse.com/${url_route}/v1/RequestVerification`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Basic-Authorization": basic_auth,
        Authorization: `Bearer ${astuteToken.data}`,
      },
      data: data,
      timeout: 90000,
    };

    // get response
    const response = await axios(config);
    // console.log(response);

    if (!response.data.Successful) {
      logger.error(
        `Unable to process ID number: ${idNumber} and TransRefGuid: ${TransRefGuid}`,
      );
      logger.error(JSON.stringify(response.data));
      astuteErrorIncrement();
      return { result: false };
    }

    let astuteResponseData: ResponseDataObj = JSON.parse(
      String(response.data.ResponseData),
    );

    if (astuteResponseData.VerificationDetails.length === 0) {
      logger.error(
        `Unable to process ID number: ${idNumber} and TransRefGuid: ${TransRefGuid}`,
      );
      logger.error(JSON.stringify(astuteResponseData));
      astuteErrorIncrement();
      return { result: false };
    }

    if (
      astuteResponseData.VerificationDetails[0].ErrorMessage !== "" &&
      astuteResponseData.VerificationDetails[0].ErrorMessage !== "Successfull"
    ) {
      logger.error(
        `Unable to process ID number: ${idNumber} and TransRefGuid: ${TransRefGuid}`,
      );
      logger.error(JSON.stringify(astuteResponseData));
      astuteErrorIncrement();
      return {
        result: false,
        error: astuteResponseData.VerificationDetails[0].ErrorMessage,
      };
    }

    // object containing data and response.data
    const return_object = {
      fullResponse: response.data,
      astuteResponse: astuteResponseData.VerificationDetails[0] || null,
      org_request: data,
    };
    astuteErrorDecrement();
    return { result: true, data: return_object };
  } catch (error) {
    astuteErrorIncrement();
    logger.error(`ID number ${idNumber} and TransRefGuid ${TransRefGuid}`);
    logger.error(`Astute QuickTransact error ${error}`);
    return { result: false };
  }
};

// FOR POSSIBLE FUTURE USE
export const AstuteCallBack = async (
  TrackingReference: string,
  client_id: string,
  client_secret: string,
  basic_auth: string,
  subscriptionKey: string,
  url_route: string,
) => {
  try {
    // get astute token

    const astuteToken = await getAstuteToken(client_id, client_secret);

    if (!astuteToken.result) {
      return { result: false };
    }

    // set axios config
    const config = {
      method: "get",
      url: `https://api.astutefse.com/${url_route}/vopd/${TrackingReference}`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Basic-Authorization": basic_auth,
        Authorization: `Bearer ${astuteToken.data}`,
      },
      timeout: 90000,
    };

    // get response
    const response = await axios(config);
    // console.log(response);

    interface ResponseDataObj {
      TransRefGuid: string;
      TrackingReference: string;
      RequestDateTime: Date;
      VopdRequestStatus: number;
      VopdRequestSource: number;
      VerificationDetails: object[];
    }

    let astuteResponseData: ResponseDataObj = response.data;
    // console.log(response.data);

    if (astuteResponseData.VerificationDetails.length === 0) {
      logger.error(`Unable to process TransRefGuid: ${TrackingReference}`);
      logger.error(JSON.stringify(response.data));
      astuteErrorIncrement();
      return { result: false };
    }

    // object containing data and response.data
    const return_object = {
      astuteResponse: astuteResponseData.VerificationDetails[0] || null,
    };
    astuteErrorDecrement();
    return { result: true, data: return_object };
  } catch (error) {
    astuteErrorIncrement();
    logger.error(`TrackingReference ${TrackingReference}`);
    logger.error(`Astute Callback error ${error}`);
    return { result: false };
  }
};
