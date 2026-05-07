import { Request, Response } from "express";
const { BrokerQuote, BrokerLead } = require("../models");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { v4 as uuidv4 } from "uuid";

export const createQuoteController = async (req: Request, res: Response) => {
  try {
    const { lead_id, quote_type = "Full" } = req.body;

    if (!lead_id) {
      return res.status(400).json({ success: false, message: "lead_id is required" });
    }

    const lead = await BrokerLead.findByPk(lead_id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const quote_reference = `QT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newQuote = await BrokerQuote.create({
      quote_id: uuidv4(),
      lead_id,
      quote_reference,
      quote_type,
      quote_status: "Draft",
      quote_version: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Quote created successfully",
      data: newQuote,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getQuotesByLeadController = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const quotes = await BrokerQuote.findAll({
      where: { lead_id: leadId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: quotes,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const getQuoteByIdController = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const quote = await BrokerQuote.findByPk(quoteId);

    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};

export const updateQuoteStatusController = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const { status } = req.body;

    const quote = await BrokerQuote.findByPk(quoteId);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    await quote.update({ quote_status: status });

    return res.status(200).json({
      success: true,
      message: "Quote status updated",
      data: quote,
    });
  } catch (err: any) {
    return res.status(400).json(sequelizeErrorHandler(err));
  }
};
