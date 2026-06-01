const { sequelize } = require("../models");
const { Op } = require("sequelize");
const { applyFilters } = require("../utils/filterHelper");

import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { AuditService } from "./auditService";
import { AuditEventType, ActionOutcome, LeadStatus } from "../enums/brokerPortalEnums";
import { v4 as uuidv4 } from "uuid";

const leadRepo = new BrokerLeadRepository();

export class BrokerLeadService {
  async createLead(data: any) {
    const t = await sequelize.transaction();
    try {
      const { 
        employerName, 
        registrationNumber, 
        industryType, 
        numberOfEmployees, 
        averageSalary, 
        province,
        contactFirstName,
        contactLastName,
        contactEmail,
        contactMobile,
        representativeId,
        brokerId
      } = data;

      // Validation
      if (!employerName) throw new Error("Employer name is required");
      if (!industryType) throw new Error("Industry type is required");
      if (numberOfEmployees === undefined || numberOfEmployees === null) throw new Error("Number of employees is required");
      if (averageSalary === undefined || averageSalary === null) throw new Error("Average salary is required");
      if (!province) throw new Error("Province is required");

      const leadReference = `LR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const lead = await leadRepo.create({
        lead_reference: leadReference,
        lead_status: (contactFirstName && contactEmail) ? LeadStatus.IN_PROGRESS : LeadStatus.DRAFT,
        last_saved_step: (contactFirstName && contactEmail) ? 2 : 1,
        representative_id: representativeId,
        broker_id: brokerId,
        is_active: true,
      }, t);

      await leadRepo.createEmployer({
        lead_id: lead.lead_id,
        employer_name: employerName,
        registration_number: registrationNumber,
        industry_type: industryType,
        number_of_employees: numberOfEmployees,
        average_salary: averageSalary,
        province: province,
      }, t);

      await leadRepo.createContact({
        lead_id: lead.lead_id,
        contact_first_name: contactFirstName,
        contact_last_name: contactLastName,
        contact_email: contactEmail,
        contact_mobile: contactMobile,
        preferred_communication_method: data.preferredCommunicationMethod || "Email",
      }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.LEAD_CREATED,
        outcome: ActionOutcome.SUCCESS,
        userId: representativeId,
        metadata: { leadId: lead.lead_id, leadReference: lead.lead_reference },
        ipAddress: data.ipAddress
      });

      return { leadId: lead.lead_id, leadReference: lead.lead_reference };
    } catch (error: any) {
      if (t && !t.finished) await t.rollback();

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

    const { where, limit, offset, order, pagination } = applyFilters(
      query,
      [
        "lead_id",
        "lead_reference",
        "lead_status",
        "representative_id",
        "broker_id",
        "is_active",
        "last_saved_step",
        "cancel_reason",
        "lead_created_at",
        "lead_updated_at",
        "cancelled_at",
        "cancelled_by",
      ],
      "lead_created_at",
      [
        "lead_id",
        "lead_reference",
        "lead_status",
        "cancel_reason",
        "$employer.employer_name$",
        "$employer.registration_number$",
        "$employer.industry_type$",
        "$employer.province$",
        "$contact.contact_first_name$",
        "$contact.contact_last_name$",
        "$contact.contact_email$",
        "$contact.contact_mobile$",
      ]
    );

    where.representative_id = representativeId;
    
    // If is_active is not explicitly provided in the query, we default to including all leads
    // for the metrics to match the list. However, if you want the list to only show active leads 
    // by default, you can uncomment the line below.
    // if (where.is_active === undefined) where.is_active = true;

    const employerWhere: any = {};
    if (clientName) {
      employerWhere.employer_name = { [Op.like]: `%${clientName}%` };
    }

    const [leadsData, rawCounts] = await Promise.all([
      leadRepo.findAndCountAll({
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
        subQuery: false,
      }),
      leadRepo.getLeadCountsByStatus(representativeId)
    ]);

    const metrics = {
      total: 0,
      active: 0,
      accepted: 0,
      cancelled: 0
    };

    rawCounts.forEach((item: any) => {
      const count = parseInt(item.count);
      const status = item.lead_status as LeadStatus;
      
      metrics.total += count;

      if ([LeadStatus.CANCELLED, LeadStatus.REJECTED, LeadStatus.EXPIRED].includes(status)) {
        metrics.cancelled += count;
      } else {
        // Everything not lost (Cancelled/Rejected/Expired) is considered Active
        metrics.active += count;

        if ([LeadStatus.ACCEPTED,LeadStatus.ONBOARDING_SUBMITTED,LeadStatus.PENDING_APPROVAL, LeadStatus.APPROVED, LeadStatus.POLICY_CREATED].includes(status)) {
          metrics.accepted += count;
        }
      }
    });

    return {
      count: leadsData.count,
      rows: leadsData.rows,
      metrics
    };
  }

  async getLeadById(leadId: string) {
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

      const unmodifiableStatuses = [
        LeadStatus.ACCEPTED, 
        LeadStatus.ONBOARDING_SUBMITTED, 
        LeadStatus.APPROVED, 
        LeadStatus.REJECTED, 
        LeadStatus.CANCELLED,
        LeadStatus.POLICY_CREATED
      ];

      if (unmodifiableStatuses.includes(lead.lead_status as LeadStatus)) {
        throw new Error(`Cannot update a lead with status: ${lead.lead_status}`);
      }

      const { employer, contact, lastSavedStep, leadStatus } = data;

      if (employer) {
        // Map UI names to DB names for employer
        const employerUpdates: any = {};
        if (employer.employerName) employerUpdates.employer_name = employer.employerName;
        if (employer.registrationNumber !== undefined) employerUpdates.registration_number = employer.registrationNumber;
        if (employer.industryType) employerUpdates.industry_type = employer.industryType;
        if (employer.numberOfEmployees !== undefined) employerUpdates.number_of_employees = employer.numberOfEmployees;
        if (employer.averageSalary !== undefined) employerUpdates.average_salary = employer.averageSalary;
        if (employer.province) employerUpdates.province = employer.province;

        if (Object.keys(employerUpdates).length > 0) {
          await leadRepo.updateEmployer(leadId, employerUpdates, t);
        }
      }

      if (contact) {
        // Map UI names to DB names for contact
        const contactUpdates: any = {};
        if (contact.contactFirstName) contactUpdates.contact_first_name = contact.contactFirstName;
        if (contact.contactLastName) contactUpdates.contact_last_name = contact.contactLastName;
        if (contact.contactEmail) contactUpdates.contact_email = contact.contactEmail;
        if (contact.contactMobile) contactUpdates.contact_mobile = contact.contactMobile;
        if (contact.preferredCommunicationMethod) contactUpdates.preferred_communication_method = contact.preferredCommunicationMethod;

        if (Object.keys(contactUpdates).length > 0) {
          await leadRepo.updateContact(leadId, contactUpdates, t);
        }
      }

      const updates: any = {};
      if (lead.lead_status === LeadStatus.DRAFT) updates.lead_status = LeadStatus.IN_PROGRESS;
      
      // Manual status override if provided (as per spec)
      if (leadStatus && Object.values(LeadStatus).includes(leadStatus)) {
        updates.lead_status = leadStatus;
      }

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

      const allowedCancelStatuses = [
        LeadStatus.DRAFT, 
        LeadStatus.IN_PROGRESS, 
        LeadStatus.QUOTE_GENERATED, 
        LeadStatus.EXPIRED
      ];

      if (!allowedCancelStatuses.includes(lead.lead_status as LeadStatus)) {
        throw new Error(`Cannot cancel an ineligible lead with status: ${lead.lead_status}`);
      }

      await leadRepo.update(leadId, {
        lead_status: LeadStatus.CANCELLED,
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

