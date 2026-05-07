import { Request, Response } from "express";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";
import {
  createLeadSchema,
  updateLeadSchema,
  cancelLeadSchema,
} from "../utils/validation";

const {
  BrokerLead,
  BrokerEmployer,
  BrokerContact,
  BrokerQuote,
  BrokerHistory,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

/**
 * Helper to log changes to BrokerHistory
 */
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
    if (t) await t.rollback();
    console.error("CREATE LEAD ERROR:", error);
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An error occurred while creating the lead",
      error: error.name,
      errors: error.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
    });
  }
};

export const getLeads = async (req: Request, res: Response) => {
  try {
    const {
      representativeId,
      leadId,
      clientName,
      leadStatus,
      dateCreatedStart,
      dateCreatedEnd,
      page = 1,
      limit = 10,
    } = req.query;

    if (!representativeId) {
      return res.status(400).json({
        success: false,
        message: "representativeId query parameter is required",
      });
    }

    const offset = (Number(page) - 1) * Number(limit);

    const leadWhere: any = { representative_id: representativeId };
    const employerWhere: any = {};

    if (leadId) {
      leadWhere.lead_reference = { [Op.like]: `%${leadId}%` };
    }
    if (leadStatus) {
      leadWhere.lead_status = leadStatus;
    }
    if (dateCreatedStart && dateCreatedEnd) {
      leadWhere.lead_created_at = {
        [Op.between]: [new Date(dateCreatedStart as string), new Date(dateCreatedEnd as string)]
      };
    }

    if (clientName) {
      employerWhere.employer_name = { [Op.like]: `%${clientName}%` };
    }

    const { count, rows: leads } = await BrokerLead.findAndCountAll({
      where: leadWhere,
      include: [
        { 
          model: BrokerEmployer, 
          as: "employer",
          where: Object.keys(employerWhere).length ? employerWhere : undefined,
          required: Object.keys(employerWhere).length > 0
        },
        { model: BrokerContact, as: "contact" },
        { model: BrokerQuote, as: "quotes", required: false }
      ],
      order: [["lead_created_at", "DESC"]],
      limit: Number(limit),
      offset: offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: {
        leads,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      },
    });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};

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
    if (t) await t.rollback();
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An error occurred while updating the lead",
      errors: error.inner?.map((e: any) => ({ field: e.path, message: e.message })) || [],
    });
  }
};

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
    if (t) await t.rollback();
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "An error occurred while cancelling the lead",
    });
  }
};

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

