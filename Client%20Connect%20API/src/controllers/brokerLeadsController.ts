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
 *               - employerName
 *               - industryType
 *               - numberOfEmployees
 *               - averageSalary
 *               - province
 *             properties:
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
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;
  const brokerId = authReq?.auth?.payload?.rmaAppAppMetadata?.brokerId;

  try {
    if (!representativeId || !brokerId) {
      return res.status(401).json({
        success: false,
        message: "Representative or Broker ID not found in token.",
      });
    }

    const payload = { ...req.body, representativeId, brokerId, ipAddress: req.ip };
    const result = await leadService.createLead(payload);

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
 *     summary: List broker leads with filtering and pagination for the authenticated representative
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: query
 *         name: lead_status
 *         schema:
 *           type: string
 *         description: Filter by lead status (e.g., Draft, In Progress, Quote Generated)
 *       - in: query
 *         name: lead_reference
 *         schema:
 *           type: string
 *         description: Filter by unique lead reference
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *         description: Search by employer name (Legacy parameter)
 *       - in: query
 *         name: $employer.employer_name$
 *         schema:
 *           type: string
 *         description: Filter by employer name
 *       - in: query
 *         name: $employer.industry_type$
 *         schema:
 *           type: string
 *         description: Filter by industry type
 *       - in: query
 *         name: $contact.contact_email$
 *         schema:
 *           type: string
 *         description: Filter by contact email
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active/inactive leads
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date starting from
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date up to
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
 *         description: Field to sort by (e.g., lead_created_at, $employer.employer_name$)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Global search (searches across reference, status, and reason)
 *     responses:
 *       200:
 *         description: List of leads
 *       401:
 *         description: Representative ID not found in token
 */
export const getLeads = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

    if (!representativeId) {
      return res.status(401).json({
        success: false,
        message: "Representative ID not found in token.",
      });
    }

    // Add representativeId to query for the service to use
    const query = { ...req.query, representativeId };
    
    const { count, rows, metrics } = await leadService.getLeads(query);
    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: {
        leads: rows,
        total: count,
        metrics,
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
 *     responses:
 *       200:
 *         description: Lead updated successfully
 */
export const updateLead = async (req: Request, res: Response) => {
  const { leadId } = req.params;
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    if (!representativeId) {
      return res.status(401).json({
        success: false,
        message: "Representative ID not found in token.",
      });
    }

    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    const lead = await leadService.updateLead(leadId, payload);

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
  const { leadId } = req.params;
  const authReq = req as any;
  const representativeId = authReq?.auth?.payload?.rmaAppAppMetadata?.representativeId;

  try {
    const payload = { ...req.body, representativeId, ipAddress: req.ip };
    await leadService.cancelLead(leadId, payload);

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
