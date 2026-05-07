import { Request, Response } from "express";
const { BrokerQuote, BrokerLead, BrokerQuoteBenefit, BrokerQuickQuoteData, sequelize } = require("../models");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { v4 as uuidv4 } from "uuid";
import { PricingService } from "../services/pricingService";
import { quickQuoteSchema, fullQuoteSchema } from "../utils/validation";

export const generateQuickQuote = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const validatedBody = await quickQuoteSchema.validate(req.body, { abortEarly: false });
    const { lead_id } = validatedBody;

    const lead = await BrokerLead.findByPk(lead_id);
    if (!lead) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const quote_reference = `QT-Q-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const quote = await BrokerQuote.create({
      quote_id: uuidv4(),
      lead_id,
      quote_reference,
      quote_type: "Quick",
      quote_status: "Draft",
      quote_version: 1,
    }, { transaction: t });

    // Save quick quote specific data
    await BrokerQuickQuoteData.create({
      quote_id: quote.quote_id,
      workforce_count: validatedBody.workforce_count,
      average_age: validatedBody.average_age,
      average_salary: validatedBody.average_salary,
      province: validatedBody.province,
      industry_type: validatedBody.industry,
    }, { transaction: t });

    // Calculate pricing
    const pricingResult = await PricingService.calculateQuotePricing({
      quote_id: quote.quote_id,
      quote_type: "Quick",
      quick_quote_data: {
        workforce_count: validatedBody.workforce_count,
        average_age: validatedBody.average_age,
        average_salary: validatedBody.average_salary,
        province: validatedBody.province,
        industry: validatedBody.industry,
      },
      benefits: validatedBody.benefits,
    });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Quick quote generated successfully",
      data: {
        quoteId: quote.quote_id,
        quoteReference: quote.quote_reference,
        pricing: pricingResult,
      },
    });
  } catch (err: any) {
    if (t) await t.rollback();
    return res.status(err.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: err.message || "An error occurred while generating quick quote",
      errors: err.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
    });
  }
};

export const generateFullQuote = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const validatedBody = await fullQuoteSchema.validate(req.body, { abortEarly: false });
    const { lead_id, product_id, benefits } = validatedBody;

    const lead = await BrokerLead.findByPk(lead_id);
    if (!lead) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const quote_reference = `QT-F-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const quote = await BrokerQuote.create({
      quote_id: uuidv4(),
      lead_id,
      product_id,
      quote_reference,
      quote_type: "Full",
      quote_status: "Draft",
      quote_version: 1,
    }, { transaction: t });

    // Calculate pricing
    const pricingResult = await PricingService.calculateQuotePricing({
      quote_id: quote.quote_id,
      quote_type: "Full",
      product_id,
      benefits,
    });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Full quote generated successfully",
      data: {
        quoteId: quote.quote_id,
        quoteReference: quote.quote_reference,
        pricing: pricingResult,
      },
    });
  } catch (err: any) {
    if (t) await t.rollback();
    return res.status(err.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: err.message || "An error occurred while generating full quote",
    });
  }
};

export const repriceQuote = async (req: Request, res: Response) => {
  try {
    const { quoteReference } = req.params;
    const quote = await BrokerQuote.findOne({
      where: { [sequelize.Op.or]: [{ quote_id: quoteReference }, { quote_reference: quoteReference }] },
      include: [
        { model: BrokerQuoteBenefit, as: "benefits" },
        { model: BrokerQuickQuoteData, as: "quick_quote_data" }
      ]
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    const pricingResult = await PricingService.calculateQuotePricing({
      quote_id: quote.quote_id,
      quote_type: quote.quote_type,
      quick_quote_data: quote.quick_quote_data,
      benefits: req.body.benefits || quote.benefits,
    });

    return res.status(200).json({
      success: true,
      message: "Quote repriced successfully",
      data: pricingResult,
    });
  } catch (err: any) {
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

export const getQuoteDetail = async (req: Request, res: Response) => {
  try {
    const { quoteReference } = req.params;
    const quote = await BrokerQuote.findOne({
      where: { [sequelize.Op.or]: [{ quote_id: quoteReference }, { quote_reference: quoteReference }] },
      include: [
        { model: BrokerQuoteBenefit, as: "benefits" },
        { model: BrokerQuickQuoteData, as: "quick_quote_data" },
        { model: BrokerLead, as: "lead" }
      ]
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (err: any) {
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

export const downloadQuoteDocument = async (req: Request, res: Response) => {
  try {
    const { quoteReference } = req.params;
    // In a real system, this would generate a PDF or return a signed URL from S3/Azure Blob
    const downloadUrl = `https://api.rma.co.za/documents/quotes/${quoteReference}.pdf`;

    return res.status(200).json({
      success: true,
      data: {
        url: downloadUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour expiry
      },
    });
  } catch (err: any) {
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

export const saveQuoteToLead = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { leadReference } = req.params;
    const { quoteId } = req.body;

    const lead = await BrokerLead.findOne({
      where: { [sequelize.Op.or]: [{ lead_id: leadReference }, { lead_reference: leadReference }] }
    });

    if (!lead) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const quote = await BrokerQuote.findByPk(quoteId);
    if (!quote) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    await lead.update({ lead_status: "Quote Generated" }, { transaction: t });
    await quote.update({ quote_status: "Generated" }, { transaction: t });

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Quote saved to lead and status updated",
    });
  } catch (err: any) {
    if (t) await t.rollback();
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

export const createQuoteController = async (req: Request, res: Response) => {
  // Legacy or generic create quote
  return generateQuickQuote(req, res);
};

export const getQuotesByLeadController = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const quotes = await BrokerQuote.findAll({
      where: { lead_id: leadId },
      order: [["createdAt", "DESC"]],
      include: [{ model: BrokerQuoteBenefit, as: "benefits" }]
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
  return getQuoteDetail(req, res);
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

