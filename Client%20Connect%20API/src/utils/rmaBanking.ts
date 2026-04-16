import axios from "axios";
import { logger } from "../middleware/logger";

export const RMABankVerification = async (
  accountNumber: string,
  branchCode: string,
  bankAccountType: number,
  accountHolderIdNumber: string = "",
) => {
  try {
    if (!accountNumber) {
      return {
        result: false,
        message: "Account number is required",
      };
    }

    let branch_code: string = branchCode;

    if (!accountHolderIdNumber) {
      return {
        result: false,
        message: "Id Number is required",
      };
    }

    if (accountNumber.length > 13) {
      return {
        result: false,
        message: "Account number must be less than 13 digits",
      };
    }

    if (branch_code.length > 6) {
      return {
        result: false,
        message: "Branch code must be 6 digits",
      };
    }

    // no real validation on RMA side
    if (accountHolderIdNumber.length === 0) {
      return {
        result: false,
        message: "No Id Number provided",
      };
    }

    // convert bankAccountType to string for RMA
    let accType: string = "00";
    if (bankAccountType === 1 || bankAccountType === 8) {
      accType = "01";
    } else if (bankAccountType === 2) {
      accType = "02";
    } else if (bankAccountType === 3) {
      accType = "03";
    } else {
      accType = "00";
    }

    let requestBody: Object = {
      operator: "ClientConn",
      accountNumber: accountNumber,
      branchCode: branch_code,
      accountType: accType,
      idNumber: accountHolderIdNumber,
      initials: null,
      lastName: null,
      userReference: "yyyyMMddHHmmssfff",
      phoneNumber: null,
      emailAddress: null,
    };

    // request
    const config = {
      method: "post",
      url: `${process.env.RMA_VOPD_URL}/bank/account-verification`,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.RMA_HYPHEN_KEY,
      },
      data: requestBody,
      timeout: 90000,
    };

    const response = await axios(config);

    // console.log(response.data);

    if (!response?.data?.success) {
      return {
        result: false,
        message: response.data.errmsg,
      };
    }

    // queue response "00001 Transaction sent to the bank. Waiting for feedback"
    if (
      response.data.errmsg ===
      "00001 Transaction sent to the bank. Waiting for feedback"
    ) {
      return {
        result: true,
        data: response.data,
        status: "pending",
      };
    }

    // 00 – Positive Match
    // 01 – Negative Match
    // 99 – Unable to verify

    // check if account exists
    if (response.data.Response.accountExists !== "00") {
      return { result: false, message: "Account doesn't exist" };
    }

    // check if ID number matches
    // if (response.data.Response.accountIdMatch !== "00") {
    //   return {
    //     result: false,
    //     message: "Account holder ID Number does not match account",
    //   };
    // }

    // check if account is open
    if (response.data.Response.accountOpen !== "00") {
      return { result: false, message: "Account is closed" };
    }

    // check if account accepts credits
    // if (response.data.Response.accountAcceptsCredits !== "00") {
    //   return { result: false, message: "Account does not accept credits" };
    // }

    // // check if account accepts debits
    // if (response.data.Response.accountAcceptsDebits !== "00") {
    //   return { result: false, message: "Account does not accept debits" };
    // }

    // check if account is open for more than 3 months
    // if (response.data.Response.accountOpenGtThreeMonths !== "00") {
    //   return {
    //     result: false,
    //     message: "Account is not open for more than 3 months",
    //   };
    // }

    // check if account type is valid
    if (response.data.Response.accountTypeValid !== "00") {
      return { result: false, message: "Account type is not valid" };
    }

    return { result: true, data: response.data, status: "success" };
  } catch (error: any) {
    logger.error(`Bank detail check error ${JSON.stringify(error)}`);
    return { result: false, message: error };
  }
};
