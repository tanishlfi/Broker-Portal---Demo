import { ManagementClient } from "auth0";
import { Request, Response } from "express";

const {
  Brokerage,
  BrokerageImportRequest,
  brokerRepresentative,
} = require("../models");

const AUTH0_BACKEND_CLIENT_ID = process.env.AUTH0_CLIENT_ID || "";
const AUTH0_BACKEND_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || "";

var management = new ManagementClient({
  domain: "cdasol.eu.auth0.com",
  clientId: AUTH0_BACKEND_CLIENT_ID,
  clientSecret: AUTH0_BACKEND_CLIENT_SECRET,
});

import * as Yup from "yup";

interface BrokerageRequestBody {
  name: string;
  emailAddress: string;
  contactNumber: string;
  FSPNumber: string;
  connection: string;
  verify_email: boolean;
  email_verified: boolean;
  brokerageStatus: string;
  user_metadata: any; // Replace 'any' with a more specific type if possible
  roles: string[];
  Representatives: {
    idNumber: string;
    firstName: string;
    surname: string;
    email: string;
    contactNumber: string;
  }[];
}

export const CreateNewBrokerage = async (req: Request, res: Response) => {
  try {
    // Input validation schema
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      emailAddress: Yup.string().email().required(),
      contactNumber: Yup.string().required(),
      FSPNumber: Yup.string().required(),
      connection: Yup.string().required(),
      verify_email: Yup.boolean().required(),
      email_verified: Yup.boolean().required(),
      brokerageStatus: Yup.string().required(),
      user_metadata: Yup.object().required(),
      roles: Yup.array().of(Yup.string()).required(),
      Representatives: Yup.array()
        .of(
          Yup.object().shape({
            idNumber: Yup.string().required(),
            firstName: Yup.string().required(),
            surname: Yup.string().required(),
            email: Yup.string().email().required(),
            contactNumber: Yup.string().required(),
          }),
        )
        .required(),
    });

    // Validate request body
    const validatedBody = (await schema.validate(
      req.body,
    )) as BrokerageRequestBody;

    const {
      name,
      emailAddress,
      contactNumber,
      FSPNumber,
      connection,
      verify_email,
      email_verified,
      brokerageStatus,
      user_metadata,
      roles,
      Representatives,
    } = validatedBody;

    // Create user and assign roles in parallel
    const user = await management.users.create({
      email: emailAddress,
      name,
      verify_email,
      email_verified,
      connection,
      user_metadata,
    });

    // Assign roles to the created user
    const assignRoles = await management.users.assignRoles(
      { id: user.data.user_id },
      { roles: roles },
    );

    const brokerage = await Brokerage.create({
      name,
      emailAddress,
      contactNumber,
      FSPNumber,
      brokerageStatus,
      Representatives,
      brokerUserId: user.data.user_id,
    });

    const importRequest = await BrokerageImportRequest.create({
      brokerageId: brokerage.id,
      FSPNumber,
      status: "pending",
    });

    const Reps = await brokerRepresentative.bulkCreate(
      Representatives.map((Representative) => ({
        ...Representative,
        brokerageId: brokerage.id,
        surnameOrCompanyName: Representative.surname,
      })),
    );

    return res.status(200).json({
      success: true,
      message: "User created",
      data: { ...user, roles: assignRoles, brokerage, importRequest, Reps },
    });
  } catch (error) {
    console.error("Error creating brokerage:", error);
    const errorMessage =
      error instanceof Yup.ValidationError
        ? error.message
        : "Internal Server Error";
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const getCreatedBrokerage = async (req: Request, res: Response) => {
  try {
    const brokerage = await Brokerage.findOne({
      where: { brokerUserId: req.params.brokerUserId },
      include: [
        {
          model: brokerRepresentative,
        },
        {
          model: BrokerageImportRequest,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Brokerage found",
      data: brokerage,
    });
  } catch (error) {
    console.error("Error getting brokerage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
