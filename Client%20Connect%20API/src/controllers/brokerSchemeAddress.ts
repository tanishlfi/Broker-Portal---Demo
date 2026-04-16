import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
const { SchemeAddress } = require("../models");

export const createBrokerSchemeAddress = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    const {
      id,
      AddressLine1,
      AddressLine2,
      City,
      Province,
      PostalCode,
      deleteAt = null,
      AddressTypeId,
      CountryId,
    } = req.body;

    const [brokerSchemeAddress, created] = await SchemeAddress.upsert(
      {
        ...(id && { id }),
        scheme_id,
        AddressLine1,
        AddressLine2,
        City,
        Province,
        PostalCode,
        AddressTypeId,
        deleteAt,
        CountryId,
        CreatedBy: String(req?.auth?.payload?.user),
        ModifiedBy: String(req?.auth?.payload?.user),
      },
      { returning: true },
    );

    if (created) {
      return res.status(201).json({
        success: true,
        message: "Broker Scheme Address Created Successfully",
        data: brokerSchemeAddress,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Broker Scheme Address Updated Successfully",
        data: brokerSchemeAddress,
      });
    }
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getBrokerAddressById = async (req: Request, res: Response) => {
  try {
    const { scheme_id } = req.params;

    const brokerSchemeAddress = await SchemeAddress.findOne({
      where: { scheme_id: scheme_id },
    });
    return res.status(200).json({
      success: true,
      message: "Broker Scheme by id Address",
      data: brokerSchemeAddress,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllBrokerAddress = async (req: Request, res: Response) => {
  try {
    const { scheme_id } = req.params;

    const brokerSchemeAddress = await SchemeAddress.findAll({
      where: { scheme_id: scheme_id },
    });
    return res.status(200).json({
      success: true,
      message: "Broker Scheme Address",
      data: brokerSchemeAddress,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
