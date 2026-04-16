import axios from "axios";
import { logger } from "../middleware/logger";

export const rmaV2 = async (
  idNumber: string,
  subscriptionKey: string,
  url_route: string = "apiqa",
) => {
  try {
    // object containing all relevant vars
    const data = {
      HomeAffairsStatusVerification: {
        idReferenceNo: idNumber,
      },
    };

    // set axios config
    // set timeout to 5000 if you want to test callback
    const config = {
      method: "post",
      url: `https://${url_route}.randmutual.co.za/home-affairs/status-verification`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      data: data,
      timeout: 90000,
    };

    // get response
    const response = await axios(config);
    // console.log(response);

    return { result: true, data: response.data };

    // if (!response.data.Successful) {
    //   logger.error(
    //     `Unable to process ID number: ${idNumber}`,
    //   );
    //   logger.error(JSON.stringify(response.data));
    //   return { result: false };
    // }

    // interface VerificationDetailsObj {
    //   Gender: string;
    //   MaritalStatus: string;
    //   DateOfDeath: Date;
    //   DateOfBirth: Date;
    //   PlaceOfDeath: string;
    //   CauseOfDeath: string;
    //   DeathUnderInvestigation: boolean;
    //   VopdVerificationType: number;
    //   IdNumber: string;
    //   ErrorMessage: string;
    //   SmartId: string;
    //   Surname: string;
    //   Forename: string;
    //   DeceasedStatus: string;
    //   RequestMessageId: string;
    // }

    // interface ResponseDataObj {
    //   TransRefGuid: string;
    //   TrackingReference: string;
    //   RequestDateTime: Date;
    //   VopdRequestStatus: number;
    //   VopdRequestSource: number;
    //   VerificationDetails: VerificationDetailsObj[];
    // }

    // let astuteResponseData: ResponseDataObj = JSON.parse(
    //   String(response.data.ResponseData),
    // );
    //   console.log(response.data);

    //   if (astuteResponseData.VerificationDetails.length === 0) {
    //     logger.error(
    //       `Unable to process ID number: ${idNumber} and TransRefGuid: ${TransRefGuid}`,
    //     );
    //     logger.error(JSON.stringify(astuteResponseData));
    //     astuteErrorIncrement();
    //     return { result: false };
    //   }

    //   if (astuteResponseData.VerificationDetails[0].ErrorMessage !== "") {
    //     logger.error(
    //       `Unable to process ID number: ${idNumber} and TransRefGuid: ${TransRefGuid}`,
    //     );
    //     logger.error(JSON.stringify(astuteResponseData));
    //     astuteErrorIncrement();
    //     return { result: false };
    //   }

    //   // object containing data and response.data
    //   const return_object = {
    //     fullResponse: response.data,
    //     astuteResponse: astuteResponseData.VerificationDetails[0] || null,
    //     org_request: data,
    //   };
    //   astuteErrorDecrement();
    //   return { result: true, data: return_object };
  } catch (error) {
    logger.error(`ID number ${idNumber}`);
    logger.error(`Astute v2 error ${error}`);
    return { result: false };
  }
};
