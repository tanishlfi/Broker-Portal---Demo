import { Request, Response } from "express";
import { BrokerQuoteService } from "../services/brokerQuote.service";

const quoteService = new BrokerQuoteService();

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
 *               gender_split:
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
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    const result = await quoteService.generateQuickQuote(payload);
    return res.status(201).json({ success: true, message: "Quick quote generated", data: result });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/quotes/full:
 *   post:
 *     summary: Generate a full quote based on captured lead data and employees
 *     tags: [Broker Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Full quote generated successfully
 */
export const generateFullQuote = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    const result = await quoteService.generateFullQuote(payload);
    return res.status(201).json({ success: true, message: "Full quote generated", data: result });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
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
 *       200:
 *         description: Onboarding details saved successfully
 */
export const saveEmployerOnboardingDetails = async (req: Request, res: Response) => {
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const { quoteId } = req.params;
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    const result = await quoteService.saveEmployerOnboardingDetails(quoteId, payload);
    return res.status(200).json({ success: true, message: "Onboarding details saved", data: result });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
  }
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
    const { count, rows } = await quoteService.getQuotesByLead(leadId, req.query);
    return res.status(200).json({ success: true, data: { quotes: rows, total: count } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/quotes/{quoteId}:
 *   get:
 *     summary: Get quote by ID
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quote fetched successfully
 */
export const getQuoteByIdController = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const quote = await quoteService.getQuoteById(quoteId);
    if (!quote) return res.status(404).json({ success: false, message: "Quote not found" });
    return res.status(200).json({ success: true, data: quote });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/quotes/lead/{leadReference}:
 *   post:
 *     summary: Save a quote to a lead
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: leadReference
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
 *               - quoteId
 *             properties:
 *               quoteId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quote saved to lead
 */
export const saveQuoteToLead = async (req: Request, res: Response) => {
  try {
    const { leadReference } = req.params;
    const { quoteId } = req.body;
    await quoteService.saveQuoteToLead(leadReference, quoteId);
    return res.status(200).json({ success: true, message: "Quote saved to lead and status updated" });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
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
    const result = await quoteService.repriceQuote(quoteId, req.body.benefits);
    return res.status(200).json({ success: true, message: "Quote repriced successfully", data: result });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/quotes/{quoteId}/download:
 *   get:
 *     summary: Download quote document
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: path
 *         name: quoteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download URL returned
 */
export const downloadQuoteDocument = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params;
    const downloadUrl = `https://api.rma.co.za/documents/quotes/${quoteId}.pdf`;
    return res.status(200).json({
      success: true,
      data: { url: downloadUrl, expiresAt: new Date(Date.now() + 3600 * 1000) }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/quotes/{quoteId}:
 *   patch:
 *     summary: Update quote details (header, quick quote, and full quote data)
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
 *               quote_type:
 *                 type: string
 *                 enum: [Quick, Full]
 *               quote_status:
 *                 type: string
 *               workforce_count:
 *                 type: integer
 *               average_age:
 *                 type: integer
 *               average_salary:
 *                 type: number
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
 *     responses:
 *       200:
 *         description: Quote updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Quote not found
 */
export const updateQuote = async (req: Request, res: Response) => {
  const { quoteId } = req.params;
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    const result = await quoteService.updateQuote(quoteId, payload);
    return res.status(200).json({ success: true, message: "Quote updated successfully", data: result });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 400).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/quotes/representative:
 *   get:
 *     summary: Get all quotes for the authenticated broker representative
 *     tags: [Broker Quotes]
 *     parameters:
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quotes
 *       401:
 *         description: Representative ID not found in token
 */
export const getQuotesByRepresentativeController = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

    if (!representativeId) {
      return res.status(401).json({
        success: false,
        message: "Representative ID not found in token.",
      });
    }

    const { clientName } = req.query;
    const { count, rows } = await quoteService.getQuotesByRepresentative(String(representativeId), req.query, clientName as string);
    return res.status(200).json({
      success: true,
      message: "Quotes fetched successfully for representative",
      data: { quotes: rows, total: count }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
