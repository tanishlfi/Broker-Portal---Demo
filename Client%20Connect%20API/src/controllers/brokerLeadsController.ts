import { Request, Response } from "express";
import { BrokerLeadService } from "../services/brokerLead.service";

const leadService = new BrokerLeadService();

/**
 * @swagger
 * /broker/leads:
 *   post:
 *     summary: Create a new broker lead
 *     tags: [Broker Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - representativeId
 *               - brokerId
 *               - employerName
 *               - industryType
 *               - numberOfEmployees
 *               - averageSalary
 *               - province
 *             properties:
 *               representativeId:
 *                 type: string
 *               brokerId:
 *                 type: string
 *               employerName:
 *                 type: string
 *               industryType:
 *                 type: string
 *               numberOfEmployees:
 *                 type: integer
 *               averageSalary:
 *                 type: number
 *               province:
 *                 type: string
 *               contactFirstName:
 *                 type: string
 *               contactLastName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactMobile:
 *                 type: string
 *               preferredCommunicationMethod:
 *                 type: string
 *                 enum: [Email, SMS]
 *     responses:
 *       201:
 *         description: Lead created successfully
 */
export const createLead = async (req: Request, res: Response) => {
  try {
    const result = await leadService.createLead(req.body);
    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("CREATE LEAD CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while creating the lead",
    });
  }
};

/**
 * @swagger
 * /broker/leads:
 *   get:
 *     summary: List broker leads with filtering and pagination
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: query
 *         name: representativeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: leadStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientName
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
 *         description: List of leads
 */
export const getLeads = async (req: Request, res: Response) => {
  try {
    const { count, rows } = await leadService.getLeads(req.query);
    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: {
        leads: rows,
        total: count,
      },
    });
  } catch (error: any) {
    console.error("GET LEADS CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching leads",
    });
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}:
 *   get:
 *     summary: Get a broker lead by ID
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead fetched successfully
 */
export const getLeadById = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await leadService.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: lead,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}:
 *   patch:
 *     summary: Update lead details
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
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
 *               employer:
 *                 type: object
 *                 properties:
 *                   employer_name:
 *                     type: string
 *                   industry_type:
 *                     type: string
 *                   number_of_employees:
 *                     type: integer
 *                   average_salary:
 *                     type: number
 *                   province:
 *                     type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   contact_first_name:
 *                     type: string
 *                   contact_last_name:
 *                     type: string
 *                   contact_email:
 *                     type: string
 *                   contact_mobile:
 *                     type: string
 *                   preferred_communication_method:
 *                     type: string
 *                     enum: [Email, SMS]
 *               lastSavedStep:
 *                 type: integer
 *               representativeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated successfully
 */
export const updateLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await leadService.updateLead(leadId, req.body);
    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}/cancel:
 *   post:
 *     summary: Cancel a lead
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead cancelled successfully
 */
export const cancelLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    await leadService.cancelLead(leadId, req.body);
    return res.status(200).json({
      success: true,
      message: "Lead cancelled successfully",
    });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}/history:
 *   get:
 *     summary: Get audit history of a lead
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead history
 */
export const getLeadHistory = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const history = await leadService.getLeadHistory(leadId);

    return res.status(200).json({
      success: true,
      message: "Lead history retrieved",
      data: history
    });
  } catch (error: any) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};
