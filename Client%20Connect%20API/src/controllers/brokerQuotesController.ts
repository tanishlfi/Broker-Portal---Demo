import { Request, Response } from "express";
const { BrokerQuote, BrokerLead, BrokerQuoteBenefit, BrokerQuickQuoteData, BrokerEmployee, BrokerQuoteOnboardingDetail, sequelize } = require("../models");
const { Op } = require("sequelize");
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import { v4 as uuidv4 } from "uuid";
import { PricingService } from "../services/pricingService";
import { quickQuoteSchema, fullQuoteSchema, employerOnboardingSchema } from "../utils/validation";
import { UploadedFile } from "express-fileupload";
import { parseAndValidateEmployeesFile } from "../services/broker.employee.upload.service";
import { applyFilters } from "../utils/filterHelper";

/**
 * @swagger
 * /broker/quotes/quick:
 *   post:
 *     summary: Generate a quick quote based on average workforce data
 *     tags: [Broker Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lead_id
 *               - workforce_count
 *               - average_age
 *               - average_salary
 *               - province
 *               - industry
 *               - benefits
 *             properties:
 *               lead_id:
 *                 type: string
 *               workforce_count:
 *                 type: integer
 *               average_age:
 *                 type: integer
 *               average_salary:
 *                 type: number
 *               province:
 *                 type: string
 *               industry:
 *                 type: string
 *               generate_options:
 *                 type: boolean
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Quick quote generated successfully
 */
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
      province: validatedBody.province,
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
        gender_split: validatedBody.gender_split,
      },
      benefits: validatedBody.benefits,
    }, t);

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
    if (t) {
        try {
            await t.rollback();
        } catch (rollbackErr) {
            // Transaction might have already been rolled back by the database on severe error
            console.error("Rollback failed or not needed:", rollbackErr);
        }
    }
    return res.status(err.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: err.message || "An error occurred while generating quick quote",
      errors: err.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
    });
  }
};

/**
 * @swagger
 * /broker/quotes/full:
 *   post:
 *     summary: Generate a full quote by uploading an employee list
 *     tags: [Broker Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               lead_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               rma_member_number:
 *                 type: string
 *               is_permanent_employees:
 *                 type: boolean
 *               is_actively_at_work:
 *                 type: boolean
 *               is_replacing_policy:
 *                 type: boolean
 *               replaced_policy_includes_disability:
 *                 type: boolean
 *               is_policy_older_than_6_months:
 *                 type: boolean
 *               replaced_policy_start_date:
 *                 type: string
 *                 format: date
 *               province:
 *                 type: string
 *               benefits:
 *                 type: string
 *                 description: JSON string of benefits
 *               employeeFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Full quote generated successfully
 */
export const generateFullQuote = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    // If benefits is a string (happens in multipart/form-data), parse it
    if (typeof req.body.benefits === "string") {
      try {
        req.body.benefits = JSON.parse(req.body.benefits);
      } catch (e) {}
    }
    if (typeof req.body.employees === "string") {
      try {
        req.body.employees = JSON.parse(req.body.employees);
      } catch (e) {}
    }

    const validatedBody = await fullQuoteSchema.validate(req.body, { abortEarly: false });
    const { lead_id, product_id, benefits } = validatedBody;

    const lead = await BrokerLead.findByPk(lead_id, {
      include: [{ model: require("../models").BrokerEmployer, as: "employer" }]
    });
    if (!lead) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    let employees_list = [];

    // Check if file is uploaded
    if (req.files && req.files.employeeFile) {
      const file = req.files.employeeFile as UploadedFile;
      const validationResult = parseAndValidateEmployeesFile(file.data);
      
      if (validationResult.errors.length > 0) {
        if (t) await t.rollback();
        return res.status(400).json({
          success: false,
          message: "Employee file has validation errors",
          errors: validationResult.errors
        });
      }

      employees_list = validationResult.employees;
    }

    // Save employees to DB (if any)
    if (employees_list.length > 0) {
      for (const emp of employees_list) {
        await BrokerEmployee.create({
          ...emp,
          lead_id: lead.lead_id,
          employee_id: uuidv4()
        }, { transaction: t });
      }
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
      rma_member_number: validatedBody.rma_member_number,
      is_permanent_employees: validatedBody.is_permanent_employees,
      is_actively_at_work: validatedBody.is_actively_at_work,
      is_replacing_policy: validatedBody.is_replacing_policy,
      replaced_policy_includes_disability: validatedBody.replaced_policy_includes_disability,
      is_policy_older_than_6_months: validatedBody.is_policy_older_than_6_months,
      replaced_policy_start_date: validatedBody.replaced_policy_start_date,
      province: validatedBody.province,
    }, { transaction: t });

    // Calculate pricing
    const pricingResult = await PricingService.calculateQuotePricing({
      quote_id: quote.quote_id,
      quote_type: "Full",
      product_id,
      benefits,
      employees_list: employees_list.length > 0 ? employees_list : undefined
    }, t);

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Full quote generated successfully",
      data: {
        quoteId: quote.quote_id,
        quoteReference: quote.quote_reference,
        pricing: pricingResult,
        employeeCount: employees_list.length
      },
    });
  } catch (err: any) {
    if (t) await t.rollback();
    console.error("FULL QUOTE ERROR:", err);
    return res.status(err.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: err.message || "An error occurred while generating full quote",
    });
  }
};

/**
 * @swagger
 * /broker/quotes/{quoteId}/reprice:
 *   post:
 *     summary: Reprice an existing quote with new benefits
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quote repriced successfully
 */
export const repriceQuote = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const quote = await BrokerQuote.findOne({
      where: { quote_id: quoteId },
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

export const downloadQuoteDocument = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    // In a real system, this would generate a PDF or return a signed URL from S3/Azure Blob
    const downloadUrl = `https://api.rma.co.za/documents/quotes/${quoteId}.pdf`;

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
    if (t) {
        try {
            await t.rollback();
        } catch (rollbackErr) {
            console.error("Rollback failed or not needed:", rollbackErr);
        }
    }
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

export const createQuoteController = async (req: Request, res: Response) => {
  // Legacy or generic create quote
  return generateQuickQuote(req, res);
};

/**
 * @swagger
 * /broker/quotes/lead/{leadId}:
 *   get:
 *     summary: Get all quotes for a specific lead with filtering and pagination
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quote_status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchFields
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: List of quotes
 */
export const getQuotesByLeadController = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    const { where, limit, offset, order, pagination } = applyFilters(
      req.query,
      ["quote_status", "quote_type", "quote_reference"]
    );

    // Force lead_id filter
    where.lead_id = leadId;

    const { count, rows: quotes } = await BrokerQuote.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: BrokerQuoteBenefit, as: "benefits" },
        { model: BrokerQuickQuoteData, as: "quick_quote_data" }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Quotes fetched successfully for lead",
      data: {
        quotes,
        pagination: {
          total: count,
          ...pagination,
          totalPages: Math.ceil(count / limit)
        }
      },
    });
  } catch (err: any) {
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

/**
 * @swagger
 * /broker/quotes/representative/{representativeId}:
 *   get:
 *     summary: Get all quotes for a specific broker representative with filtering and pagination
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: representativeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quote_status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchFields
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: List of quotes
 */
export const getQuotesByRepresentativeController = async (req: Request, res: Response) => {
  try {
    const { representativeId } = req.params;
    const { clientName } = req.query;

    const { where, limit, offset, order, pagination } = applyFilters(
      req.query,
      ["quote_status", "quote_type", "quote_reference"]
    );

    const { count, rows: quotes } = await BrokerQuote.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: BrokerLead,
          as: "lead",
          where: { representative_id: representativeId },
          attributes: ["lead_id", "lead_reference", "representative_id"],
          include: [
            {
              model: require("../models").BrokerEmployer,
              as: "employer",
              where: clientName ? { employer_name: { [Op.like]: `%${clientName}%` } } : undefined,
              required: !!clientName
            }
          ]
        },
        { model: BrokerQuoteBenefit, as: "benefits" },
        { model: BrokerQuickQuoteData, as: "quick_quote_data" }
      ],
      distinct: true
    });

    return res.status(200).json({
      success: true,
      message: "Quotes fetched successfully for representative",
      data: {
        quotes,
        pagination: {
          total: count,
          ...pagination,
          totalPages: Math.ceil(count / limit)
        }
      },
    });
  } catch (err: any) {
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

/**
 * @swagger
 * /broker/quotes/{quoteId}:
 *   get:
 *     summary: Get a specific quote by its UUID (quote_id)
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quote details
 */
export const getQuoteByIdController = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const quote = await BrokerQuote.findOne({
      where: { quote_id: quoteId },
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
      message: "Quote fetched successfully",
      data: quote,
    });
  } catch (err: any) {
    return res.status(500).json(sequelizeErrorHandler(err));
  }
};

/**
 * @swagger
 * /broker/quotes/{quoteId}/status:
 *   patch:
 *     summary: Update the status of a quote
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quote status updated
 */
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

/**
 * @swagger
 * /broker/quotes/{quoteId}/employer-details:
 *   post:
 *     summary: Capture and save employer and payment details for onboarding
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_authorised
 *               - is_director
 *               - first_name
 *               - surname
 *               - date_of_birth
 *               - cellphone
 *               - has_sa_id
 *               - id_or_passport_number
 *               - nationality
 *               - home_address
 *               - email_for_policy_documents
 *               - email_for_monthly_invoice
 *               - boss_first_name
 *               - boss_surname
 *               - boss_date_of_birth
 *               - boss_has_sa_id
 *               - boss_id_or_passport
 *               - boss_nationality
 *               - business_type
 *               - country_of_incorporation
 *               - registered_name
 *               - trading_name
 *               - registration_number
 *               - registered_address
 *               - physical_address
 *               - bank_name
 *               - bank_account_number
 *               - bank_account_type
 *               - debit_day_of_month
 *               - source_of_funds
 *               - company_tax_number
 *               - debit_order_authorised
 *             properties:
 *               is_authorised:
 *                 type: boolean
 *               is_director:
 *                 type: boolean
 *               first_name:
 *                 type: string
 *               surname:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               cellphone:
 *                 type: string
 *               landline:
 *                 type: string
 *               has_sa_id:
 *                 type: boolean
 *               id_or_passport_number:
 *                 type: string
 *               passport_expiry:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               home_address:
 *                 type: string
 *               email_for_policy_documents:
 *                 type: string
 *               email_for_monthly_invoice:
 *                 type: string
 *               boss_first_name:
 *                 type: string
 *               boss_surname:
 *                 type: string
 *               boss_date_of_birth:
 *                 type: string
 *                 format: date
 *               boss_has_sa_id:
 *                 type: boolean
 *               boss_id_or_passport:
 *                 type: string
 *               boss_passport_expiry:
 *                 type: string
 *                 format: date
 *               boss_nationality:
 *                 type: string
 *               business_type:
 *                 type: string
 *               country_of_incorporation:
 *                 type: string
 *               registered_name:
 *                 type: string
 *               trading_name:
 *                 type: string
 *               registration_number:
 *                 type: string
 *               stock_exchange_listing_name:
 *                 type: string
 *               registered_address:
 *                 type: string
 *               physical_address:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               bank_account_number:
 *                 type: string
 *               bank_account_type:
 *                 type: string
 *                 enum: [Cheque, Current, Savings, Transmission]
 *               debit_day_of_month:
 *                 type: integer
 *               source_of_funds:
 *                 type: string
 *               company_tax_number:
 *                 type: string
 *               company_vat_number:
 *                 type: string
 *               debit_order_authorised:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Onboarding details saved successfully
 */
export const saveEmployerOnboardingDetails = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { quoteId } = req.params;
    const validatedBody = await employerOnboardingSchema.validate(req.body, { abortEarly: false });

    const quote = await BrokerQuote.findByPk(quoteId);
    if (!quote) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Quote not found" });
    }

    // Save or update onboarding details
    const [details, created] = await BrokerQuoteOnboardingDetail.findOrCreate({
      where: { quote_id: quoteId },
      defaults: {
        ...validatedBody,
        lead_id: quote.lead_id,
      },
      transaction: t,
    });

    if (!created) {
      await details.update(validatedBody, { transaction: t });
    }

    // Update quote status to reflect that onboarding details are captured
    await quote.update({ quote_status: "Awaiting OTP" }, { transaction: t });

    await t.commit();

    return res.status(created ? 201 : 200).json({
      success: true,
      message: "Employer onboarding details saved successfully",
      data: details,
    });
  } catch (err: any) {
    if (t) await t.rollback();
    return res.status(err.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: err.message || "An error occurred while saving onboarding details",
      errors: err.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
    });
  }
};

