import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
const { SchemeNote } = require("../models");

export const addBrokerSchemeNote = async (req: Request, res: Response) => {
  try {
    const { scheme_id } = req.params;
    const { note, active } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    const newBrokerSchemeNote = await SchemeNote.create(
      {
        scheme_id,
        note,
        active,
        created_by: String(req?.auth?.payload?.user),
      },
      { returning: true },
    );

    return res.status(201).json({
      success: true,
      message: "Broker scheme note added",
      data: newBrokerSchemeNote,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getAllBrokerSchemeNotes = async (req: Request, res: Response) => {
  try {
    const { scheme_id } = req.params;

    const brokerSchemeNotes = await SchemeNote.findAll({
      where: {
        scheme_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Broker scheme notes retrieved",
      data: brokerSchemeNotes,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
