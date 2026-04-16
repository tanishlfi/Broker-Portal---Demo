import { Request, Response } from "express";

const { policyNote } = require("../models");

import { sequelizeErrorHandler } from "../middleware/sequelize_error";

// @description Controller to add a policy note
export const addPolicyNote = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    const { note } = req.body;

    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Policy id is required",
      });
    }

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    const newPolicyNote = await policyNote.create(
      {
        policyId: policyId,
        note: note,
        createdBy: String(req?.auth?.payload?.user),
        updatedBy: String(req?.auth?.payload?.user),
      },
      { returning: true },
    );

    return res.status(201).json({
      success: true,
      message: "Policy note added",
      data: newPolicyNote,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description delete policy note
export const deletePolicyNote = async (req: Request, res: Response) => {
  try {
    const { policyId, noteId } = req.params;

    if (!policyId || !noteId) {
      return res.status(400).json({
        success: false,
        message: "Policy id and note id are required",
      });
    }

    const deletedPolicyNote = await policyNote.destroy({
      where: { policyId: policyId, id: noteId },
    });

    return res.status(200).json({
      success: deletedPolicyNote == 1 ? true : false,
      message:
        deletedPolicyNote == 1
          ? "Policy note deleted"
          : "Policy note not found",
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Controller to update policy note
export const updatePolicyNote = async (req: Request, res: Response) => {
  try {
    const { policyId, noteId } = req.params;
    const { note } = req.body;

    if (!policyId || !noteId) {
      return res.status(400).json({
        success: false,
        message: "Policy id and note id are required",
      });
    }

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    const updatedPolicyNote = await policyNote.update(
      { note: note, updatedBy: String(req?.auth?.payload?.user) },
      {
        returning: true,
        where: { policyId: policyId, id: noteId },
      },
    );
    return res.status(200).json({
      success: updatedPolicyNote[0] == 1 ? true : false,
      message:
        updatedPolicyNote[0] == 1
          ? "Policy note updated"
          : "Policy note not found",
      data: updatedPolicyNote[1][0],
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Controller to get policy notes
export const getPolicyNotes = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;

    if (!policyId) {
      return res.status(400).json({
        success: false,
        message: "Policy id is required",
      });
    }

    const policyNotes = await policyNote.findAll({
      where: { policyId: Number(policyId) },
    });

    // check if policy notes is empty
    if (policyNotes.length == 0) {
      return res.status(200).json({
        success: false,
        message: "No policy notes found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy notes retrieved",
      data: policyNotes,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};

// @description Controller to get policy note
export const getPolicyNote = async (req: Request, res: Response) => {
  try {
    const { policyId, noteId } = req.params;

    if (!policyId || !noteId) {
      return res.status(400).json({
        success: false,
        message: "Policy id and note id are required",
      });
    }

    const policyNoteData = await policyNote.findOne({
      where: { policyId: Number(policyId), id: noteId },
    });

    // check if policy notes is empty
    if (!policyNoteData) {
      return res.status(200).json({
        success: false,
        message: "No policy note found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy note retrieved",
      data: policyNoteData,
    });
  } catch (err: any) {
    res.status(400).json(sequelizeErrorHandler(err));
  }
};
