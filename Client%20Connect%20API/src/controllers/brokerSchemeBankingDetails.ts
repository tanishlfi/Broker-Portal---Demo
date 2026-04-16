import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
const { SchemeBankingDetail } = require("../models");
import { RMABankVerification } from "../utils/rmaBanking";

export const createBrokerBankingDetails = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;
    const {
      id,
      AccountNumber,
      BankBranchId,
      BankAccountType,
      BranchCode,
      BankName,
      AccountHolderInitials,
      AccountHolderSurname,
      idNumber,
    } = req.body;

    const hyphen_verification: any = await RMABankVerification(
      AccountNumber,
      BranchCode,
      BankAccountType,
      idNumber,
    );

    if (!hyphen_verification.result) {
      return res.status(400).json(hyphen_verification);
    }

    const AccountHolderName: string = `${AccountHolderInitials} ${AccountHolderSurname}`;

    const [brokerBankingDetails, created] = await SchemeBankingDetail.upsert(
      {
        ...(id && { id }),
        scheme_id,
        AccountNumber,
        AccountHolderInitials,
        AccountHolderSurname,
        BankBranchId,
        BankAccountType,
        AccountHolderName,
        BranchCode,
        BankName,
        idNumber,
        hyphen_verification: hyphen_verification.data,
        status: hyphen_verification.status,
      },
      { returning: true },
    );

    const message = created
      ? "Broker Banking Details Created Successfully"
      : "Broker Banking Details Updated Successfully";

    return res.status(created ? 201 : 200).json({
      success: true,
      message,
      data: brokerBankingDetails,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllBrokerBankingDetails = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    const brokerBankingDetails = await SchemeBankingDetail.findAll({
      where: { scheme_id },
    });
    return res.status(200).json({
      success: true,
      message: "Broker Banking Details",
      data: brokerBankingDetails,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Error, could not get Broker Banking Details",
      error: err,
    });
  }
};

export const getBrokerBankingDetailsById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    const brokerBankingDetails = await SchemeBankingDetail.findOne({
      where: { scheme_id },
    });
    return res.status(200).json({
      success: true,
      message: "Broker Banking Details",
      data: brokerBankingDetails,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Error, could not get Broker Banking Details",
      error: err,
    });
  }
};
