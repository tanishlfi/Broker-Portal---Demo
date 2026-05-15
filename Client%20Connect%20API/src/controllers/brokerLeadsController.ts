import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import {
  createLeadSchema,
  updateLeadSchema,
  cancelLeadSchema,
} from "../utils/validation";
import { UploadedFile } from "express-fileupload";
import { parseAndValidateEmployeesFile } from "../services/broker.employee.upload.service"; // Force re-parse
import { applyFilters } from "../utils/filterHelper";

const {
  BrokerLead,
  BrokerEmployer,
  BrokerContact,
  BrokerQuote,
  BrokerHistory,
  BrokerEmployee,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const logHistory = async (
  tableName: string,
  recordId: string | number,
  changeType: "CREATE" | "UPDATE" | "DELETE",
  before: any,
  after: any,
  updatedBy: string,
  t?: any
) => {
  try {
    await BrokerHistory.create(
      {
        table_name: tableName,
        record_id: String(recordId),
        change_type: changeType,
        before_value: before,
        after_value: after,
        changed_by: updatedBy,
      },
      { transaction: t }
    );
  } catch (error) {
    console.error("Failed to log history:", error);
  }
};

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
 *               - contactFirstName
 *               - contactLastName
 *               - contactEmail
 *               - contactMobile
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
 *                 enum: [Email, SMS, Call]
 *     responses:
 *       201:
 *         description: Lead created successfully
 */
export const createLead = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const validatedBody = await createLeadSchema.validate(req.body, { abortEarly: false });

    const leadReference = `LR-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000,
    )}`;

    const lead = await BrokerLead.create(
      {
        lead_reference: leadReference,
        lead_status: "Draft",
        representative_id: validatedBody.representativeId,
        broker_id: validatedBody.brokerId,
        is_active: true,
      },
      { transaction: t },
    );

    await BrokerEmployer.create(
      {
        lead_id: lead.lead_id,
        employer_name: validatedBody.employerName,
        industry_type: validatedBody.industryType,
        number_of_employees: validatedBody.numberOfEmployees,
        average_salary: validatedBody.averageSalary,
        province: validatedBody.province,
      },
      { transaction: t },
    );

    await BrokerContact.create(
      {
        lead_id: lead.lead_id,
        contact_first_name: validatedBody.contactFirstName,
        contact_last_name: validatedBody.contactLastName,
        contact_email: validatedBody.contactEmail,
        contact_mobile: validatedBody.contactMobile,
        preferred_communication_method: validatedBody.preferredCommunicationMethod || "Email",
      },
      { transaction: t },
    );

    await logHistory(
      "BrokerLead",
      lead.lead_id,
      "CREATE",
      null,
      lead.toJSON(),
      validatedBody.representativeId,
      t
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: {
        leadId: lead.lead_id,
        leadReference: lead.lead_reference,
      },
    });
  } catch (error: any) {
    if (t) {
      try {
        await t.rollback();
      } catch (rbErr) {
        // Already rolled back by DB
      }
    }
    console.error("CREATE LEAD ERROR:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An error occurred while creating the lead",
      error: error.name,
      errors: error.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
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
    const { representativeId, clientName } = req.query;

    if (!representativeId) {
      return res.status(400).json({
        success: false,
        message: "representativeId query parameter is required",
      });
    }

    const { where, limit, offset, order, pagination } = applyFilters(
      req.query,
      ["lead_status", "lead_reference", "broker_id"],
      "lead_created_at"
    );

    // Force representativeId filter
    where.representative_id = representativeId;

    // Handle employer-specific filtering (clientName)
    const employerWhere: any = {};
    if (clientName) {
      employerWhere.employer_name = { [Op.like]: `%${clientName}%` };
    }

    const { count, rows: leads } = await BrokerLead.findAndCountAll({
      where,
      include: [
        { 
          model: BrokerEmployer, 
          as: "employer",
          where: clientName ? employerWhere : undefined,
          required: !!clientName
        },
        { model: BrokerContact, as: "contact" },
        { model: BrokerQuote, as: "quotes", required: false }
      ],
      order: order.length > 0 ? order : [["lead_created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: {
        leads,
        pagination: {
          total: count,
          ...pagination,
          totalPages: Math.ceil(count / limit)
        }
      },
    });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};


/**
 * @swagger
 * /broker/leads/{leadId}:
 *   get:
 *     summary: Get details of a specific lead
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details
 *       404:
 *         description: Lead not found
 */
export const getLeadById = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await BrokerLead.findOne({
      where: { [Op.or]: [{ lead_id: leadId }, { lead_reference: leadId }] },
      include: [
        { model: BrokerEmployer, as: "employer" },
        { model: BrokerContact, as: "contact" },
        { model: BrokerQuote, as: "quotes" }
      ],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: lead,
    });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}:
 *   put:
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
 *     responses:
 *       200:
 *         description: Lead updated successfully
 */
export const updateLead = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { leadId } = req.params;
    const lead = await BrokerLead.findByPk(leadId);
    if (!lead) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const unmodifiableStatuses = [
      "Accepted",
      "Onboarding Submitted",
      "Approved",
      "Rejected",
      "Cancelled",
    ];

    if (unmodifiableStatuses.includes(lead.lead_status)) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: `Cannot update a lead with status: ${lead.lead_status}`,
      });
    }

    const validatedBody = await updateLeadSchema.validate(req.body, { abortEarly: false });
    const { employer, contact, lastSavedStep } = validatedBody;

    const beforeLead = lead.toJSON();

    if (employer) {
      await BrokerEmployer.update(employer, {
        where: { lead_id: leadId },
        transaction: t,
      });
    }

    if (contact) {
      await BrokerContact.update(contact, {
        where: { lead_id: leadId },
        transaction: t,
      });
    }

    const updates: any = {};
    if (lead.lead_status === "Draft") {
      updates.lead_status = "In Progress";
    }
    if (lastSavedStep) {
      updates.last_saved_step = lastSavedStep;
    }

    if (Object.keys(updates).length > 0) {
      await lead.update(updates, { transaction: t });
    }

    await logHistory(
      "BrokerLead",
      lead.lead_id,
      "UPDATE",
      beforeLead,
      lead.toJSON(),
      req.body.representativeId || lead.representative_id,
      t
    );

    await t.commit();
    return res.status(200).json({ 
      success: true, 
      message: "Lead updated successfully",
      data: lead 
    });
  } catch (error: any) {
    if (t) {
      try {
        await t.rollback();
      } catch (rbErr) {
        // Already rolled back by DB
      }
    }
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An error occurred while updating the lead",
      errors: error.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
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
  const t = await sequelize.transaction();
  try {
    const { leadId } = req.params;
    const validatedBody = await cancelLeadSchema.validate(req.body, { abortEarly: false });
    const { reason, representativeId } = validatedBody;

    const lead = await BrokerLead.findByPk(leadId);
    if (!lead) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const allowedCancelStatuses = [
      "Draft",
      "In Progress",
      "Quote Generated",
      "Expired"
    ];

    if (!allowedCancelStatuses.includes(lead.lead_status)) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: `Cannot cancel an ineligible lead with status: ${lead.lead_status}`,
      });
    }

    const beforeLead = lead.toJSON();

    await lead.update({
      lead_status: "Cancelled",
      cancelled_at: new Date(),
      cancelled_by: representativeId || lead.representative_id,
      cancel_reason: reason,
      is_active: false,
    }, { transaction: t });

    await logHistory(
      "BrokerLead",
      lead.lead_id,
      "UPDATE",
      beforeLead,
      lead.toJSON(),
      representativeId || lead.representative_id,
      t
    );

    await t.commit();
    return res.status(200).json({ 
      success: true, 
      message: "Lead cancelled successfully" 
    });
  } catch (error: any) {
    if (t) {
      try {
        await t.rollback();
      } catch (rbErr) {
        // Already rolled back by DB
      }
    }
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An error occurred while cancelling the lead",
    });
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}/continue:
 *   get:
 *     summary: Continue a lead (transition from Draft to Qualified)
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead transitioned successfully
 */
export const continueLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await BrokerLead.findOne({
      where: { [Op.or]: [{ lead_id: leadId }, { lead_reference: leadId }] },
      include: [
        { model: BrokerEmployer, as: "employer" },
        { model: BrokerContact, as: "contact" },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead data retrieved for continuation",
      data: {
        ...lead.toJSON(),
        lastSavedStep: lead.last_saved_step || 1
      }
    });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
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
    
    // Find the lead first to get the internal lead_id if reference was passed
    const lead = await BrokerLead.findOne({
      where: { [Op.or]: [{ lead_id: leadId }, { lead_reference: leadId }] }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const history = await BrokerHistory.findAll({
      where: {
        table_name: "BrokerLead",
        record_id: lead.lead_id
      },
      order: [["created_at", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      message: "Lead history retrieved",
      data: history
    });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};

/**
 * @swagger
 * /broker/leads/{leadId}/upload-employees:
 *   post:
 *     summary: Upload an Excel or CSV file containing employee data for a lead
 *     tags: [Broker Leads]
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lead
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The Excel (.xlsx) or CSV file to upload
 *     responses:
 *       200:
 *         description: File uploaded and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRows:
 *                       type: integer
 *                     validCount:
 *                       type: integer
 *                     invalidCount:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid file format or missing file
 *       404:
 *         description: Lead not found
 *       500:
 *         description: Internal server error
 */
export const uploadEmployeesController = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { leadId } = req.params;

    // 1. Verify Lead exists
    const lead = await BrokerLead.findOne({
      where: { [Op.or]: [{ lead_id: leadId }, { lead_reference: leadId }] },
    });

    if (!lead) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // 2. Extract file from request
    if (!req.files || Object.keys(req.files).length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
    }

    const fileKey = Object.keys(req.files)[0];
    const uploadedFile = req.files[fileKey] as UploadedFile;

    // 3. Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (uploadedFile.size > MAX_FILE_SIZE) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "File is too large. Maximum size allowed is 10MB.",
      });
    }

    // 4. Check allowed extensions (csv, xlsx)
    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    
    const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["csv", "xlsx"];

    if (!allowedMimeTypes.includes(uploadedFile.mimetype) && !allowedExtensions.includes(fileExtension || "")) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only CSV and XLSX are allowed.",
      });
    }

    // 4. Parse and validate file using the service
    const validationResult = parseAndValidateEmployeesFile(uploadedFile.data);

    if (validationResult.totalRows === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "The uploaded file is empty or missing expected headers.",
      });
    }

    // 5. Bulk insert all parsed employees into the table with the lead_id.
    const employeesToInsert = validationResult.employees.map((emp: any) => ({
      ...emp,
      lead_id: lead.lead_id,
    }));

    await BrokerEmployee.bulkCreate(employeesToInsert, { transaction: t });

    await logHistory(
      "BrokerLead",
      lead.lead_id,
      "UPDATE",
      null,
      { action: "Employees Uploaded", count: validationResult.totalRows },
      "System",
      t
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Employees processed successfully.",
      data: {
        totalRows: validationResult.totalRows,
        validCount: validationResult.validCount,
        invalidCount: validationResult.invalidCount,
        errors: validationResult.errors,
      },
    });
  } catch (error: any) {
    if (t) {
      try {
        await t.rollback();
      } catch (rbErr) {
        // Already rolled back by DB
      }
    }
    console.error("UPLOAD EMPLOYEES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while uploading employees.",
    });
  }
};

