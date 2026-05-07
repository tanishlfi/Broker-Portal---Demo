import { Request, Response } from "express";
import * as Yup from "yup";
import { sequelizeErrorHandler } from "../middleware/sequelize_error";

const {
  BrokerLead,
  BrokerEmployer,
  BrokerContact,
  BrokerQuote,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

export const createLead = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const schema = Yup.object().shape({
      employerName: Yup.string().required("Employer name cannot be empty"),
      registrationNumber: Yup.string().nullable(),
      industryType: Yup.string().required("Industry classification cannot be empty"),
      numberOfEmployees: Yup.number().integer("Must be an integer").min(1, "Workforce size must be > 0").required("Employees count is required"),
      averageSalary: Yup.number().min(0, "Average salary must be >= 0").nullable(),
      province: Yup.string().required("Province cannot be empty"),
      contactFirstName: Yup.string().required("Contact first name cannot be empty"),
      contactLastName: Yup.string().required("Contact surname cannot be empty"),
      contactEmail: Yup.string().email("Must be a valid email format").required("Email cannot be empty"),
      contactMobile: Yup.string().min(10, "Must be a valid mobile format").required("Mobile cannot be empty"),
      preferredCommunicationMethod: Yup.string().oneOf(["Email", "SMS", "Phone"], "Must be valid communication preference").nullable(),
      representativeId: Yup.string().uuid("Must be valid ID format").required("Representative ID is required"),
      brokerId: Yup.string().uuid("Must be valid ID format").required("Broker ID is required"),
    });

    const validatedBody = await schema.validate(req.body, { abortEarly: false });

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

    await t.commit();

    return res.status(201).json({
      success: true,
      data: {
        leadId: lead.lead_id,
        leadReference: lead.lead_reference,
      },
      message: "Lead created successfully",
    });
  } catch (error: any) {
    if (t) await t.rollback();
    return res.status(error instanceof Yup.ValidationError ? 400 : 500).json(sequelizeErrorHandler(error));
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
    } = req.query;

    if (!representativeId) {
      return res.status(400).json({
        success: false,
        message: "Validation failed: representativeId query parameter is required",
        error_code: "ValidationError"
      });
    }

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
    } else if (dateCreatedStart) {
      leadWhere.lead_created_at = { [Op.gte]: new Date(dateCreatedStart as string) };
    } else if (dateCreatedEnd) {
      leadWhere.lead_created_at = { [Op.lte]: new Date(dateCreatedEnd as string) };
    }

    if (clientName) {
      employerWhere.employer_name = { [Op.like]: `%${clientName}%` };
    }

    const includeArray: any[] = [
      { 
        model: BrokerEmployer, 
        as: "employer",
        where: Object.keys(employerWhere).length ? employerWhere : undefined,
        required: Object.keys(employerWhere).length > 0
      },
      { model: BrokerContact, as: "contact" },
    ];

    if (BrokerQuote) {
      // Include quotes if model exists for QuoteStatus / QuoteType future filtering
      includeArray.push({ model: BrokerQuote, as: "quotes", required: false });
    }

    const leads = await BrokerLead.findAll({
      where: leadWhere,
      include: includeArray,
      order: [["lead_created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: leads,
      message: "Leads fetched successfully",
    });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await BrokerLead.findOne({
      where: { lead_id: leadId },
      include: [
        { model: BrokerEmployer, as: "employer" },
        { model: BrokerContact, as: "contact" },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Lead not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
      message: "Lead fetched successfully",
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
        data: null,
        message: "Lead not found",
        errors: [],
      });
    }

    const unmodifiableStatuses = [
      "Pending Underwriting",
      "Completed",
      "Active",
      "Cancelled",
      "Rejected",
      "Lapsed",
      "Terminated",
      "Voided"
    ];

    if (unmodifiableStatuses.includes(lead.lead_status)) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        data: null,
        message: `Cannot update a lead with status: ${lead.lead_status}`,
        errors: [],
      });
    }

    const schema = Yup.object().shape({
      employer: Yup.object().shape({
        employer_name: Yup.string().min(1, "Employer name cannot be empty"),
        registration_number: Yup.string().nullable(),
        industry_type: Yup.string().min(1, "Industry classification cannot be empty"),
        number_of_employees: Yup.number().integer("Must be an integer").min(1, "Workforce size must be > 0"),
        average_salary: Yup.number().min(0, "Average salary must be >= 0").nullable(),
        province: Yup.string().min(1, "Province cannot be empty"),
      }).nullable(),
      contact: Yup.object().shape({
        contact_first_name: Yup.string().min(1, "Contact first name cannot be empty"),
        contact_last_name: Yup.string().min(1, "Contact surname cannot be empty"),
        contact_email: Yup.string().email("Must be a valid email format"),
        contact_mobile: Yup.string().min(10, "Must be a valid mobile format"),
        preferred_communication_method: Yup.string().oneOf(["Email", "SMS", "Phone"], "Must be valid communication preference"),
      }).nullable()
    });

    const validatedBody = await schema.validate(req.body, { abortEarly: false });
    const { employer, contact } = validatedBody;

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

    if (lead.lead_status === "Draft") {
      await lead.update({ lead_status: "In Progress" }, { transaction: t });
    }

    await t.commit();
    return res
      .status(200)
      .json({ success: true, message: "Lead updated successfully" });
  } catch (error: any) {
    if (t) await t.rollback();
    return res.status(error instanceof Yup.ValidationError ? 400 : 500).json(sequelizeErrorHandler(error));
  }
};

export const cancelLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { reason, representativeId } = req.body;

    const lead = await BrokerLead.findByPk(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Lead not found",
        errors: [],
      });
    }

    const allowedCancelStatuses = [
      "Draft",
      "In Progress",
      "In Review",
      "Requires Corrections",
      "Quote Generated",
      "Quote Expired"
    ];

    if (!allowedCancelStatuses.includes(lead.lead_status)) {
      return res.status(422).json({
        success: false,
        data: null,
        message: `Cannot cancel an ineligible lead with status: ${lead.lead_status}`,
        errors: [],
      });
    }

    await lead.update({
      lead_status: "Cancelled",
      cancelled_at: new Date(),
      cancelled_by: representativeId || null,
      is_active: false,
    });

    return res
      .status(200)
      .json({ success: true, message: "Lead cancelled successfully" });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};

export const continueLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await BrokerLead.findOne({
      where: { lead_id: leadId },
      include: [
        { model: BrokerEmployer, as: "employer" },
        { model: BrokerContact, as: "contact" },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Lead not found",
        errors: [],
      });
    }

    const allowedContinueStatuses = [
      "Draft",
      "In Progress",
      "In Review",
      "Requires Corrections",
      "Quote Generated",
      "Quote Expired"
    ];

    if (!allowedContinueStatuses.includes(lead.lead_status)) {
      return res.status(422).json({
        success: false,
        data: null,
        message: `Cannot continue an ineligible lead with status: ${lead.lead_status}`,
        errors: [],
      });
    }

    return res
      .status(200)
      .json({ success: true, data: lead, message: "Lead resumed" });
  } catch (error: any) {
    return res.status(500).json(sequelizeErrorHandler(error));
  }
};
