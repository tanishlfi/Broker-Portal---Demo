const { sequelize } = require("../models");
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { AuditService } from "./auditService";
import { AuditEventType, ActionOutcome } from "../enums/brokerPortalEnums";
import { v4 as uuidv4 } from "uuid";

const leadRepo = new BrokerLeadRepository();

export class BrokerLeadService {
  async createLead(data: any) {
    const t = await sequelize.transaction();
    try {
      const leadReference = `LR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const lead = await leadRepo.create({
        lead_reference: leadReference,
        lead_status: (data.contactFirstName && data.contactEmail) ? "In Progress" : "Draft",
        last_saved_step: (data.contactFirstName && data.contactEmail) ? 2 : 1,
        representative_id: data.representativeId,
        broker_id: data.brokerId,
        is_active: true,
      }, t);

      await leadRepo.createEmployer({
        lead_id: lead.lead_id,
        employer_name: data.employerName,
        industry_type: data.industryType,
        number_of_employees: data.numberOfEmployees,
        average_salary: data.averageSalary,
        province: data.province,
      }, t);

      await leadRepo.createContact({
        lead_id: lead.lead_id,
        contact_first_name: data.contactFirstName,
        contact_last_name: data.contactLastName,
        contact_email: data.contactEmail,
        contact_mobile: data.contactMobile,
        preferred_communication_method: data.preferredCommunicationMethod || "Email",
      }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_CREATED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId,
        metadata: { leadId: lead.lead_id, leadReference: lead.lead_reference },
        ipAddress: data.ipAddress
      });

      return { leadId: lead.lead_id, leadReference: lead.lead_reference };
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_CREATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async getLeads(query: any) {
    const { representativeId, clientName } = query;
    const { applyFilters } = require("../utils/filterHelper");
    const { Op } = require("sequelize");

    const { where, limit, offset, order, pagination } = applyFilters(
      query,
      ["lead_status", "lead_reference", "broker_id"],
      "lead_created_at"
    );

    where.representative_id = representativeId;

    const employerWhere: any = {};
    if (clientName) {
      employerWhere.employer_name = { [Op.like]: `%${clientName}%` };
    }

    return await leadRepo.findAndCountAll({
      where,
      include: [
        {
          model: require("../models").BrokerEmployer,
          as: "employer",
          where: clientName ? employerWhere : undefined,
          required: !!clientName
        },
        { model: require("../models").BrokerContact, as: "contact" },
        { model: require("../models").BrokerQuote, as: "quotes", required: false }
      ],
      order: order.length > 0 ? order : [["lead_created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
    });
  }

  async getLeadById(leadId: string) {
    const { Op } = require("sequelize");
    return await leadRepo.findOne({
      where: { [Op.or]: [{ lead_id: leadId }, { lead_reference: leadId }] },
      include: [
        { model: require("../models").BrokerEmployer, as: "employer" },
        { model: require("../models").BrokerContact, as: "contact" },
        { model: require("../models").BrokerQuote, as: "quotes" }
      ],
    });
  }

  async updateLead(leadId: string, data: any) {
    const t = await sequelize.transaction();
    try {
      const lead = await leadRepo.findById(leadId);
      if (!lead) throw new Error("Lead not found");

      const unmodifiableStatuses = ["Accepted", "Onboarding Submitted", "Approved", "Rejected", "Cancelled"];
      if (unmodifiableStatuses.includes(lead.lead_status)) {
        throw new Error(`Cannot update a lead with status: ${lead.lead_status}`);
      }

      const beforeLead = lead.toJSON();
      const { employer, contact, lastSavedStep } = data;

      if (employer) await leadRepo.updateEmployer(leadId, employer, t);
      if (contact) await leadRepo.updateContact(leadId, contact, t);

      const updates: any = {};
      if (lead.lead_status === "Draft") updates.lead_status = "In Progress";
      if (lastSavedStep) updates.last_saved_step = lastSavedStep;

      if (Object.keys(updates).length > 0) {
        await leadRepo.update(leadId, updates, t);
      }

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_UPDATED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId || lead.representative_id,
        metadata: { leadId, updates },
        ipAddress: data.ipAddress
      });

      return lead;
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_UPDATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { leadId, error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async cancelLead(leadId: string, data: any) {
    const t = await sequelize.transaction();
    try {
      const lead = await leadRepo.findById(leadId);
      if (!lead) throw new Error("Lead not found");

      const allowedCancelStatuses = ["Draft", "In Progress", "Quote Generated", "Expired"];
      if (!allowedCancelStatuses.includes(lead.lead_status)) {
        throw new Error(`Cannot cancel an ineligible lead with status: ${lead.lead_status}`);
      }

      await leadRepo.update(leadId, {
        lead_status: "Cancelled",
        cancelled_at: new Date(),
        cancelled_by: data.representativeId || lead.representative_id,
        cancel_reason: data.reason,
        is_active: false,
      }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_UPDATED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId || lead.representative_id,
        metadata: { leadId, action: "CANCEL", reason: data.reason },
        ipAddress: data.ipAddress
      });

      return true;
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_UPDATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { leadId, action: "CANCEL", error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }
}

