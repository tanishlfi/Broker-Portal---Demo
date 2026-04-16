import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
const {
  BrokerScheme,
  SchemeRoleplayer,
  SchemeCollectionDetail,
  SchemeAddress,
  SchemeDocument,
  SchemeBankingDetail,
  SchemeNote,
} = require("../models");

export const GetAllNewScheme = async (req: Request, res: Response) => {
  try {
    const allNewSchemes = await BrokerScheme.findAll();
    return res.status(200).json({
      success: true,
      message: "All New Schemes",
      data: allNewSchemes,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const GetAllBrokerSchemes = async (req: Request, res: Response) => {
  try {
    const { BrokerageId } = req.params;

    const allBrokerSchemes = await BrokerScheme.findAll({
      where: { BrokerageId: BrokerageId },
      include: [
        { model: SchemeRoleplayer },
        { model: SchemeAddress },
        { model: SchemeBankingDetail },
        { model: SchemeDocument },
        { model: SchemeNote },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "All Broker Schemes",
      data: allBrokerSchemes,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllViewchemes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const allBrokerSchemes = await BrokerScheme.findAll({
      where: { id },
      include: [
        { model: SchemeRoleplayer },

        { model: SchemeAddress },
        { model: SchemeBankingDetail },
        { model: SchemeDocument },
        { model: SchemeNote },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "All Broker Schemes",
      data: allBrokerSchemes,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getSchemeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const scheme = await BrokerScheme.findOne({
      where: { id: id },
      include: [
        { model: SchemeRoleplayer },
        { model: SchemeAddress },
        { model: SchemeBankingDetail },
        { model: SchemeDocument },
        { model: SchemeNote },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "Broker Scheme",
      data: scheme,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const createBrokerScheme = async (req: Request, res: Response) => {
  try {
    const BrokerageId = req.params.BrokerageId;

    const {
      id,
      RepresentativeId,
      ProductOptionID,
      RolePlayerId,
      DisplayName,
      VatRegistrationNumber,
      ClientTypeID,
      CompanyTypeId,
      RolePlayerIdentificationTypeId,
      IdNumber,
      TellNumber,
      CellNumber,
      EmailAddress,
      JoinDate,
      status,
      ApproverId,
    } = req.body;

    // Create the new broker scheme
    const [brokerScheme, created] = await BrokerScheme.upsert(
      {
        ...(id && { id }),
        BrokerageId,
        RepresentativeId,
        ProductOptionID,
        RolePlayerId,
        DisplayName,
        VatRegistrationNumber,
        ClientTypeID,
        CompanyTypeId,
        RolePlayerIdentificationTypeId,
        IdNumber,
        TellNumber,
        CellNumber,
        EmailAddress,
        JoinDate,
        status,
        CreatedBy: String(req?.auth?.payload?.user),
        ApproverId,
      },
      {
        returning: true,
      },
    );

    if (created) {
      return res.status(201).json({
        success: true,
        message: "Broker Scheme created successfully",
        data: brokerScheme,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Broker Scheme updated successfully",
        data: brokerScheme,
      });
    }
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// The Roleplayer
export const createBrokerSchemeRoleplayer = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    console.log(`scheme_id: ${scheme_id}`);

    const {
      id,
      ReferenceNo,
      ExpiryDate,
      GeneratedDate,
      Lives,
      Premium,
      status,
      CommissionFee,
      ServiceFee,
      BinderFee,
      document,
      PayDate,
      PaymentMethod,
      PaymentFrequency,
    } = req.body;

    if (!scheme_id) {
      return res.status(400).json({
        success: false,
        message: "scheme_id is missing",
      });
    }

    const [brokerSchemeRoleplayer, created] = await SchemeRoleplayer.upsert(
      {
        ...(id && { id }),
        scheme_id,
        ReferenceNo,
        ExpiryDate,
        GeneratedDate,
        Lives,
        Premium,
        status,
        CommissionFee,
        ServiceFee,
        BinderFee,
        document,
        PayDate,
        PaymentMethod,
        PaymentFrequency,
      },
      {
        returning: true,
      },
    );

    if (created) {
      return res.status(201).json({
        success: true,
        message: "Broker scheme roleplayer created successfully",
        data: brokerSchemeRoleplayer,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Broker scheme roleplayer updated successfully",
        data: brokerSchemeRoleplayer,
      });
    }
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getBrokerSchemeRoleplayerById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    const brokerSchemeRoleplayer = await SchemeRoleplayer.findOne({
      where: { scheme_id },
    });
    return res.status(200).json({
      success: true,
      message: "Broker Scheme Roleplayer",
      data: brokerSchemeRoleplayer,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getBrokerSchemeCollectionDetailById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    const brokerSchemeCollectionDetail = await SchemeCollectionDetail.findOne({
      where: { scheme_id },
    });
    return res.status(200).json({
      success: true,
      message: "Broker Scheme Collection Detail",
      data: brokerSchemeCollectionDetail,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const createBrokerCollectionDetails = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheme_id } = req.params;

    const {
      id,
      commission_fee_percentage,
      service_fee_percentage,
      binder_fee_percentage,
      qoute_date,
      qoute_id,
      lives,
      premium,
      qoute_status,
    } = req.body;

    // check if scheme_id is missing
    if (!scheme_id) {
      return res.status(400).json({
        success: false,
        message: "scheme_id is missing",
      });
    }

    const [brokerSchemeCollectionDetail, created] =
      await SchemeCollectionDetail.upsert(
        {
          ...(id && { id }),
          scheme_id,
          commission_fee_percentage,
          service_fee_percentage,
          binder_fee_percentage,
          qoute_date,
          qoute_id,
          lives,
          premium,
          qoute_status,
        },
        {
          returning: true,
        },
      );

    if (created) {
      return res.status(201).json({
        success: true,
        message: "Broker scheme collection detail created successfully",
        data: brokerSchemeCollectionDetail,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Broker scheme collection detail updated successfully",
        data: brokerSchemeCollectionDetail,
      });
    }
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllSchemes = async (req: Request, res: Response) => {
  try {
    const allBrokerSchemes = await BrokerScheme.findAll({
      include: [
        { model: SchemeRoleplayer },

        { model: SchemeAddress },
        { model: SchemeBankingDetail },
        { model: SchemeDocument },
        { model: SchemeNote },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "All Broker Schemes",
      data: allBrokerSchemes,
    });
  } catch (err: any) {
    console.log(`not hitting the try ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const updateScheme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const [updatedRows] = await BrokerScheme.update(updateData, {
      where: { id },
    });

    if (updatedRows > 0) {
      const updatedScheme = await BrokerScheme.findByPk(id);
      return res.status(200).json({
        success: true,
        message: "Broker Scheme updated successfully",
        data: updatedScheme,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Broker Scheme not found",
      });
    }
  } catch (err: any) {
    console.log(`Error: ${err}`);
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
