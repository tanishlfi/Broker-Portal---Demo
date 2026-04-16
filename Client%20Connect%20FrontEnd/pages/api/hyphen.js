import { getSession } from "@auth0/nextjs-auth0";
import axios from "axios";

export default async function POST(req, res) {
  try {
    const session = await getSession(req, res);

    if (!session) {
      return res.status(401).json({
        result: false,
        message: "Unauthorized",
      });
    }

    const {
      accountNumber,
      branchCode,
      bankAccountType,
      accountHolderIdNumber,
    } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        result: false,
        message: "Account number is required",
      });
    }

    if (!accountHolderIdNumber) {
      return res.status(400).json({
        result: false,
        message: "Id Number is required",
      });
    }

    if (accountNumber.length > 13) {
      return res.status(400).json({
        result: false,
        message: "Account number must be less than 13 digits",
      });
    }

    if (branchCode.length > 6) {
      return res.status(400).json({
        result: false,
        message: "Branch code must be 6 digits",
      });
    }

    // no real validation on RMA side
    if (accountHolderIdNumber.length === 0) {
      return res.status(400).json({
        result: false,
        message: "No Id Number provided",
      });
    }

    // convert bankAccountType to string for RMA
    const accType =
      bankAccountType === 1 || bankAccountType === 8
        ? "01"
        : bankAccountType === 2
        ? "02"
        : bankAccountType === 3
        ? "03"
        : "00";

    let requestBody = {
      operator: "ClientConn",
      accountNumber: accountNumber,
      branchCode: branchCode,
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

    console.log("response", response.data);
    if (!response?.data?.success) {
      return res.status(400).json({
        result: false,
        message: response.data.errmsg,
      });
    }

    // queue response "00001 Transaction sent to the bank. Waiting for feedback"
    if (
      response.data.errmsg ===
      "00001 Transaction sent to the bank. Waiting for feedback"
    ) {
      return res.status(400).json({
        result: true,
        message: "Transaction sent to the bank. Waiting for feedback",
        data: response.data,
        hyphenStatus: "pending",
      });
    }

    // 00 – Positive Match
    // 01 – Negative Match
    // 99 – Unable to verify

    // check if account exists
    if (response.data.Response.accountExists !== "00") {
      return res.status(400).json({
        result: false,
        message: "Account doesn't exist",
        data: response.data,
        hyphenStatus: "Fail",
      });
    }

    // check if ID number matches
    // if (response.data.Response.accountIdMatch !== "00") {
    //   return res.status(400).json({
    //     result: false,
    //     message: "Account holder ID does not match account",
    //     data: response.data,
    //     hyphenStatus: "Fail",
    //   });
    // }

    // check if account is open
    if (response.data.Response.accountOpen !== "00") {
      return res.status(400).json({
        result: false,
        message: "Account is closed",
        data: response.data,
        hyphenStatus: "Fail",
      });
    }

    // check if account accepts credits
    // if (response.data.Response.accountAcceptsCredits !== "00") {
    //   return res.status(400).json({
    //     result: false,
    //     message: "Account does not accept credits",
    //     data: response.data,
    //     hyphenStatus: "Fail",
    //   });
    // }

    // check if account accepts debits
    // if (response.data.Response.accountAcceptsDebits !== "00") {
    //   return res.status(400).json({
    //     result: false,
    //     message: "Account does not accept debits",
    //     data: response.data,
    //     hyphenStatus: "Fail",
    //   });
    // }

    // check if account is open for more than 3 months
    // if (response.data.Response.accountOpenGtThreeMonths !== "00") {
    //   return res.status(400).json({
    //     result: false,
    //     message: "Account is not open for more than 3 months",
    //   });
    // }

    // check if account type is valid
    if (response.data.Response.accountTypeValid !== "00") {
      return res.status(400).json({
        result: false,
        message: "Account type is not valid",
        data: response.data,
        hyphenStatus: "Fail",
      });
    }

    return res
      .status(400)
      .json({ result: true, data: response.data, hyphenStatus: "Verified" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
