import { SAIDValidator } from "../utils/validator";
import { Request, Response } from "express";
import {
  AstuteQuickTransact,
  AstuteErrorCount,
  AstuteCallBack,
} from "../utils/astute";
import { RMAQuickTransact, rmaVOPDErrorCount } from "../utils/rmaVOPD";
import { rmaV2 } from "../utils/rmav2";
import { logger } from "../middleware/logger";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { add } from "winston";
import { TableHints } from "sequelize";
const { AstuteResponse } = require("../models");
const { Op, literal } = require("sequelize");

// @desc    Single VOPD request, query from Astute can take up to 90 seconds
export const singleVOPDRequest = async (req: Request, res: Response) => {
  // generate uuidv4
  // const TransRefGuid: string = v4();
  try {
    // get idNumber from request body
    const { idNumber } = req.body;

    // always remember to add in stringify for object as otherwise it causes errors
    logger.debug(JSON.stringify(req.body));
    // get result from SAIDValidator
    let result: boolean = SAIDValidator(idNumber);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID Number",
        ...req.body,
      });
    }

    // remove spaces from idNumber
    let idNumberUpd: string = String(idNumber).replace(/\s/g, "");

    // check if idNumber has a recent response
    const recentResponse = await AstuteResponse.findOne({
      // select idNumber, firstName, surname, dateOfBirth, dateOfDeath
      attributes: [
        "idNumber",
        "firstName",
        "surname",
        "dateOfBirth",
        "dateOfDeath",
        "createdAt",
        "status",
        "gender",
        "maritalStatus",
        "deceasedStatus",
      ],
      // where idNumber is equal to the idNumber passed in
      where: {
        idNumber: idNumberUpd,
      },
      tableHints: TableHints.NOLOCK,
    });

    // console.log("recent", recentResponse);

    if (recentResponse) {
      if (recentResponse.status === "fail") {
        return res.status(400).json({
          success: false,
          message: "Invalid ID Number",
        });
      }

      // if person date of death is not null then return
      if (recentResponse.dateOfDeath) {
        return res.status(200).json({
          success: true,
          message: "Response found - Person is deceased",
          data: recentResponse.dataValues,
        });
      }

      // check if createdAt is greater than 30 days ago
      if (
        dayjs(recentResponse.createdAt).isAfter(dayjs().subtract(30, "day"))
      ) {
        if (recentResponse.status === "completed") {
          return res.status(200).json({
            success: true,
            message: "Recent response found",
            data: recentResponse.dataValues,
          });
        }
        return res.status(202).json({
          success: false,
          message: "Recent submission found, but not yet processed",
        });
      }
    }

    // check astute error count, TODO add to v2 process
    const astuteErrorCount = await rmaVOPDErrorCount();

    if (astuteErrorCount.count > 10) {
      logger.error(`Astute error count: ${astuteErrorCount.count}`);
      logger.error(
        `Process locked for another: ${astuteErrorCount.minutes} minutes`,
      );

      await AstuteResponse.upsert({
        idNumber: idNumberUpd,
        status: "pending",
      });

      return res.status(202).json({
        success: false,
        message: `VOPD service unavailable, ID number will be run in the next bulk process`,
      });
    }

    // get astute response
    const astuteResponse = await RMAQuickTransact(idNumberUpd);

    if (!astuteResponse.result) {
      // if (astuteResponse.error) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Invalid request - ${astuteResponse.error}`,
      //   });
      // }

      await AstuteResponse.upsert({
        idNumber: idNumberUpd,
        status: "pending",
      });

      return res.status(202).json({
        success: false,
        message: `VOPD service unavailable, ID number will be run in the next bulk process`,
      });
    }

    // if astuteResponse.data is empty then return error

    if (
      astuteResponse.data?.astuteResponse?.ErrorMessage ===
        "ID Number valid but not found on NPR" ||
      astuteResponse.data?.astuteResponse?.ErrorMessage ===
        "ID Number was not found on Track and Trace"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID number",
      });
    }

    // add response to db
    const dbData = {
      idNumber: idNumber,
      // transRef: TransRefGuid,
      status: "completed",
      fullResponse: JSON.stringify(astuteResponse.data?.fullResponse),
      firstName: astuteResponse.data?.astuteResponse?.Forename,
      surname: astuteResponse.data?.astuteResponse?.Surname,
      dateOfDeath: astuteResponse.data?.astuteResponse?.DateOfDeath
        ? dayjs(astuteResponse.data?.astuteResponse?.DateOfDeath).format(
            "YYYY-MM-DD",
          )
        : null,
      dateOfBirth: astuteResponse.data?.astuteResponse?.DateOfBirth
        ? dayjs(astuteResponse.data?.astuteResponse?.DateOfBirth).format(
            "YYYY-MM-DD",
          )
        : null,
      maritalStatus: astuteResponse.data?.astuteResponse?.MaritalStatus,
      gender: astuteResponse.data?.astuteResponse?.Gender,
    };
    const [addResponse, created] = await AstuteResponse.upsert(dbData);

    // console.log(addResponse);
    // console.log(created);
    // check if addResponse.dataValues is blank
    if (!addResponse) {
      return res.status(400).json({
        success: false,
        message: "Unable to process ID number",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request successful",
      data: {
        idNumber: addResponse.idNumber,
        firstName: addResponse.firstName,
        surname: addResponse.surname,
        dateOfBirth: addResponse.dateOfBirth,
        dateOfDeath: addResponse.dateOfDeath,
        createdAt: addResponse.createdAt,
        maritalStatus: addResponse.maritalStatus,
        gender: addResponse.gender,
        status: addResponse.status,
      },
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @desc  Return VOPD processed within a period
export const vopdProcessed = async (req: Request, res: Response) => {
  try {
    dayjs.extend(customParseFormat);
    let { start, end, status, idNumber } = req.query;
    // check if start is a date if specified
    if (start) {
      if (!dayjs(String(start), "YYYYMMDD", true).isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }
    }

    // check if end is a date if specified
    if (end) {
      if (!dayjs(String(end), "YYYYMMDD", true).isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }
      end = dayjs(String(end), "YYYYMMDD", true).format("YYYY-MM-DDT23:59:59");
    }

    let statusArr = ["completed", "pending", "submitted", "fail"];
    // check if status is valid if specified
    if (status) {
      // change status to array if not already

      statusArr = String(status).split(",") || [
        "completed",
        "fail",
        "pending",
        "submitted",
      ];

      if (
        !statusArr.includes("completed") &&
        !statusArr.includes("fail") &&
        !statusArr.includes("pending") &&
        !statusArr.includes("submitted")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
    }

    // if start not specific then set start to 10 days ago
    if (!start) {
      start = dayjs().subtract(10, "day").format("YYYY-MM-DD");
    }
    // if end not specific then set end to today
    if (!end) {
      end = dayjs().format("YYYY-MM-DDT23:59:59");
    }

    let whereCondition: Object = {
      where: {
        status: {
          [Op.in]: statusArr,
        },
        updatedAt: {
          [Op.between]: [start, end],
        },
      },
    };

    if (idNumber) {
      // if idNumber check that it is only numbers
      if (!/^\d+$/.test(String(idNumber))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID Number",
        });
      }

      // if idNumber set whereIdNumber to idNumber with wildcards
      whereCondition = {
        where: {
          idNumber: {
            [Op.like]: `%${idNumber}%`,
          },
        },
      };
    }

    const astuteResponse = await AstuteResponse.findAndCountAll({
      ...whereCondition,
      attributes: [
        "idNumber",
        "firstName",
        "surname",
        "dateOfBirth",
        "dateOfDeath",
        "createdAt",
        "status",
        "gender",
        "maritalStatus",
        [
          literal(
            "case when dateOfDeath is not null then 'DECEASED' else 'ALIVE' end",
          ),
          "deceasedStatus",
        ],
      ],
    });

    // replace status of fail with Invalid Id Number
    astuteResponse.rows.forEach((element: any) => {
      if (element.status === "fail") {
        element.status = "Invalid Id Number";
      }
    });

    if (astuteResponse.count === 0) {
      return res.status(200).json({
        success: false,
        message: "No VOPD processed within the time period",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "List returned", data: astuteResponse });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @desc    Check Astute health
export const astuteHealth = async (req: Request, res: Response) => {
  try {
    const astuteErrorCount = await rmaVOPDErrorCount();
    if (astuteErrorCount.count > 10) {
      logger.error(`Astute error count: ${astuteErrorCount.count}`);
      logger.error(
        `Process locked for another: ${astuteErrorCount.minutes} minutes`,
      );
      return res.status(500).json({
        success: false,
        message: `Astute service unavailable, please try again in ${astuteErrorCount.minutes} minutes`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Astute service available",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Astute service unavailable",
    });
  }
};

export const singleVOPDCallback = async (req: Request, res: Response) => {
  try {
    if (!req.params.TransRef) {
      return res.status(400).json({
        success: false,
        message: "Invalid TransRef",
      });
    }
    // get idNumber from request body
    let { TransRef } = req.params;
    // check astute error count, if more than 10 wait for up to 15 minutes
    const astuteErrorCount = await AstuteErrorCount();
    logger.debug(`Astute error count: ${astuteErrorCount.count}`);
    if (astuteErrorCount.count > 10) {
      logger.error(`Astute error count: ${astuteErrorCount.count}`);
      logger.error(
        `Process locked for another: ${astuteErrorCount.minutes} minutes`,
      );
      return res.status(500).json({
        success: false,
        message: `Astute service unavailable, please try again in ${astuteErrorCount.minutes} minutes`,
      });
    }
    const astuteCallbackResponse = await AstuteCallBack(
      TransRef,
      String(process.env.ASTUTE_CLIENT_ID),
      String(process.env.ASTUTE_CLIENT_SECRET),
      String(process.env.ASTUTE_BASIC_AUTH),
      String(process.env.ASTUTE_SUB_KEY_CALLBACK),
      String(process.env.ASTUTE_CALLBACK),
    );

    logger.debug(astuteCallbackResponse);
    if (!astuteCallbackResponse.result) {
      // todo write astute error to log

      // todo add id to bulk process if invalid response

      return res.status(400).json({
        success: false,
        message: "Unable to process ID number",
      });
    }

    return res.status(200).json({
      success: true,
      transRef: TransRef,
      ...astuteCallbackResponse.data?.astuteResponse,
    });
  } catch {
    res.status(400).json({
      success: false,
      message: "Unable to validate ID Number",
    });
  }
};

// @desc    Add ID number to process
export const addIDVOPD = async (idNumber: string) => {
  try {
    // get result from SAIDValidator
    let result: boolean = SAIDValidator(idNumber);

    if (!result) {
      return false;
    }

    // remove spaces from idNumber
    idNumber = String(idNumber).replace(/\s/g, "");

    await AstuteResponse.upsert({
      idNumber: idNumber,
      status: "pending",
    });

    return true;
  } catch {
    return false;
  }
};

export const singleVOPDQ = async (req: Request, res: Response) => {
  try {
    // get idNumber from request body
    let { idNumber } = req.body;
    console.log(req.body);
    // get result from SAIDValidator
    let result: boolean = SAIDValidator(idNumber);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID Number",
        ...req.body,
      });
    }

    // remove spaces from idNumber
    idNumber = String(idNumber).replace(/\s/g, "");

    // get rma v2 response
    const rmaV2Response = await rmaV2(
      idNumber,
      String(process.env.RMA_SUBSCRIPTION_KEY),
    );

    logger.debug(rmaV2Response);
    if (!rmaV2Response.result) {
      // todo write astute error to log

      // todo add id to bulk process if invalid response

      return res.status(400).json({
        success: false,
        message: "Unable to process ID number",
      });
    }

    return res.status(202).json({
      success: true,
      message: "Queued for processing",
    });
  } catch {
    res.status(400).json({
      success: false,
      message: "Unable to validate ID Number",
    });
  }
};
