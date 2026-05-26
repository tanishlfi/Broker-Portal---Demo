const { sequelize, BrokerEmployee } = require("../models");
import { BrokerQuoteRepository } from "../repositories/brokerQuote.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { PricingHelper } from "../utils/pricingHelper";
import { AuditService } from "./auditService";
import { AuditEventType, ActionOutcome } from "../enums/brokerPortalEnums";
import { v4 as uuidv4 } from "uuid";

const quoteRepo = new BrokerQuoteRepository();
const leadRepo = new BrokerLeadRepository();

export class BrokerQuoteService {
  async generateQuickQuote(data: any) {
    const t = await sequelize.transaction();
    try {
      const lead = await leadRepo.findById(data.lead_id);
      if (!lead) throw new Error("Lead not found");

      const quote_reference = `QT-Q-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const quote = await quoteRepo.create({
        quote_id: uuidv4(),
        lead_id: data.lead_id,
        quote_reference,
        quote_type: "Quick",
        quote_status: "Draft",
        quote_version: 1,
        province: data.province,
      }, t);

      const pricingResult = await PricingHelper.calculateQuotePricing({
        quote_id: quote.quote_id,
        quote_type: "Quick",
        quick_quote_data: {
          workforce_count: data.workforce_count,
          average_age: data.average_age,
          average_salary: data.average_salary,
          province: data.province,
          industry: data.industry,
          gender_split: data.gender_split,
        },
        benefits: data.benefits,
      }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId,
        metadata: { quoteType: "QUICK", leadId: data.lead_id, quoteId: quote.quote_id },
        ipAddress: data.ipAddress
      });

      return { quoteId: quote.quote_id, quoteReference: quote.quote_reference, pricing: pricingResult };
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteType: "QUICK", error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async generateFullQuote(data: any) {
    const t = await sequelize.transaction();
    try {
      const lead = await leadRepo.findById(data.lead_id);
      if (!lead) throw new Error("Lead not found");

      const employees_list = await BrokerEmployee.findAll({
        where: { lead_id: lead.lead_id },
        transaction: t
      });

      const quote_reference = `QT-F-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const quote = await quoteRepo.create({
        quote_id: uuidv4(),
        lead_id: data.lead_id,
        product_id: data.product_id,
        quote_reference,
        quote_type: "Full",
        quote_status: "Draft",
        quote_version: 1,
        rma_member_number: data.rma_member_number,
        is_permanent_employees: data.is_permanent_employees,
        is_actively_at_work: data.is_actively_at_work,
        is_replacing_policy: data.is_replacing_policy,
        replaced_policy_includes_disability: data.replaced_policy_includes_disability,
        is_policy_older_than_6_months: data.is_policy_older_than_6_months,
        replaced_policy_start_date: data.replaced_policy_start_date,
        province: data.province,
      }, t);

      const pricingResult = await PricingHelper.calculateQuotePricing({
        quote_id: quote.quote_id,
        quote_type: "Full",
        product_id: data.product_id,
        benefits: data.benefits,
        employees_list: employees_list.length > 0 ? employees_list : undefined
      }, t);

      // Update Lead and Quote status to reflect successful generation
      await leadRepo.update(data.lead_id, { lead_status: "Quote Generated" }, t);
      await quoteRepo.update(quote.quote_id, { quote_status: "Generated" }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId,
        metadata: { quoteType: "FULL", leadId: data.lead_id, quoteId: quote.quote_id, employeeCount: employees_list.length },
        ipAddress: data.ipAddress
      });

      return { quoteId: quote.quote_id, quoteReference: quote.quote_reference, pricing: pricingResult, employeeCount: employees_list.length };
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteType: "FULL", error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async saveEmployerOnboardingDetails(quoteId: string, data: any) {
    const t = await sequelize.transaction();
    try {
      const quote = await quoteRepo.findById(quoteId);
      if (!quote) throw new Error("Quote not found");

      const [details, created] = await quoteRepo.findOrCreateOnboardingDetail(quoteId, {
        ...data,
        lead_id: quote.lead_id,
      }, t);

      if (!created) await details.update(data, { transaction: t });

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.ONBOARDING_SUBMITTED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId || "SYSTEM",
        metadata: { quoteId, leadId: quote.lead_id },
        ipAddress: data.ipAddress
      });

      return details;
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.ONBOARDING_SUBMITTED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteId, error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async getQuotesByLead(leadId: string, query: any) {
    const { applyFilters } = require("../utils/filterHelper");
    const { where, limit, offset, order, pagination } = applyFilters(
      query,
      [
        "quote_id",
        "lead_id",
        "product_id",
        "quote_reference",
        "quote_type",
        "quote_status",
        "quote_version",
        "total_premium",
        "premium_frequency",
        "pricing_reference",
        "quote_generated_at",
        "quote_expiry_date",
        "employer_accepted_at",
        "employer_accepted_by_otp",
        "rma_member_number",
        "is_permanent_employees",
        "is_actively_at_work",
        "is_replacing_policy",
        "replaced_policy_includes_disability",
        "is_policy_older_than_6_months",
        "replaced_policy_start_date",
        "province",
      ],
      "createdAt",
      ["quote_reference", "quote_status", "total_premium", "province","quote_type","quote_id","lead_id"]
    );
    where.lead_id = leadId;

    return await quoteRepo.findAndCountAll({
      where, limit, offset, order,
      include: [
        { model: require("../models").BrokerQuoteBenefit, as: "benefits" },
        { model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" }
      ]
    });
  }

  async getQuoteById(quoteId: string) {
    return await quoteRepo.findOne({
      where: { quote_id: quoteId },
      include: [
        { model: require("../models").BrokerQuoteBenefit, as: "benefits" },
        { model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" },
        {
          model: require("../models").BrokerLead,
          as: "lead",
          include: [
            { model: require("../models").BrokerEmployer, as: "employer" },
            { model: require("../models").BrokerContact, as: "contact" }
          ]
        }
      ]
    });
  }

  async saveQuoteToLead(leadReference: string, quoteId: string) {
    const t = await sequelize.transaction();
    try {
      const { Op } = require("sequelize");
      const lead = await leadRepo.findOne({
        where: { [Op.or]: [{ lead_id: leadReference }, { lead_reference: leadReference }] }
      });
      if (!lead) throw new Error("Lead not found");

      const quote = await quoteRepo.findById(quoteId);
      if (!quote) throw new Error("Quote not found");

      await leadRepo.update(lead.lead_id, { lead_status: "Quote Generated" }, t);
      await quoteRepo.update(quote.quote_id, { quote_status: "Generated" }, t);

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async repriceQuote(quoteId: string, benefits: any) {
    const quote = await quoteRepo.findOne({
      where: { quote_id: quoteId },
      include: [
        { model: require("../models").BrokerQuoteBenefit, as: "benefits" },
        { model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" }
      ]
    });

    if (!quote) throw new Error("Quote not found");

    return await PricingHelper.calculateQuotePricing({
      quote_id: quote.quote_id,
      quote_type: quote.quote_type,
      quick_quote_data: quote.quick_quote_data,
      benefits: benefits || quote.benefits,
    });
  }

  async updateQuote(quoteId: string, data: any) {
    const t = await sequelize.transaction();
    try {
      const quote = await quoteRepo.findById(quoteId, {
        include: [{ model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" }]
      });
      if (!quote) throw new Error("Quote not found");

      const {
        quote_type,
        quote_status,
        workforce_count,
        average_age,
        average_salary,
        rma_member_number,
        is_permanent_employees,
        is_actively_at_work,
        is_replacing_policy,
        replaced_policy_includes_disability,
        is_policy_older_than_6_months,
        replaced_policy_start_date,
        province
      } = data;

      // 1. Update Header / Full Quote Data
      const headerUpdates: any = {};
      if (quote_type !== undefined) headerUpdates.quote_type = quote_type;
      if (quote_status !== undefined) headerUpdates.quote_status = quote_status;
      if (rma_member_number !== undefined) headerUpdates.rma_member_number = rma_member_number;
      if (is_permanent_employees !== undefined) headerUpdates.is_permanent_employees = is_permanent_employees;
      if (is_actively_at_work !== undefined) headerUpdates.is_actively_at_work = is_actively_at_work;
      if (is_replacing_policy !== undefined) headerUpdates.is_replacing_policy = is_replacing_policy;
      if (replaced_policy_includes_disability !== undefined) headerUpdates.replaced_policy_includes_disability = replaced_policy_includes_disability;
      if (is_policy_older_than_6_months !== undefined) headerUpdates.is_policy_older_than_6_months = is_policy_older_than_6_months;
      if (replaced_policy_start_date !== undefined) headerUpdates.replaced_policy_start_date = replaced_policy_start_date;
      if (province !== undefined) headerUpdates.province = province;

      if (Object.keys(headerUpdates).length > 0) {
        await quoteRepo.update(quoteId, headerUpdates, t);
      }

      // 2. Update Quick Quote Data (if applicable)
      if (workforce_count !== undefined || average_age !== undefined || average_salary !== undefined) {
        if (!quote.quick_quote_data) {
          // If it doesn't exist, we might need to create it if we are switching to Quick Quote
          // But usually QuoteType change is handled separately.
          // For now, assume it must exist for updates.
          throw new Error("Cannot update Quick Quote fields for a non-Quick Quote");
        }

        const qqUpdates: any = {};
        if (workforce_count !== undefined) {
          if (workforce_count <= 0) throw new Error("WorkforceCount must be greater than 0");
          qqUpdates.workforce_count = workforce_count;
        }
        if (average_age !== undefined) {
          if (average_age <= 0) throw new Error("AverageAge must be greater than 0");
          qqUpdates.average_age = average_age;
        }
        if (average_salary !== undefined) {
          if (average_salary < 0) throw new Error("AverageSalary must be greater than or equal to 0");
          qqUpdates.average_salary = average_salary;
        }

        if (Object.keys(qqUpdates).length > 0) {
          await quote.quick_quote_data.update(qqUpdates, { transaction: t });
        }
      }

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED, 
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId,
        metadata: { quoteId, updates: data },
        ipAddress: data.ipAddress
      });

      return await quoteRepo.findById(quoteId, {
        include: [
          { model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" },
          { model: require("../models").BrokerQuoteBenefit, as: "benefits" }
        ]
      });
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteId, error: error.message },
        ipAddress: data.ipAddress
      });

      throw error;
    }
  }

  async getQuotesByRepresentative(representativeId: string, query: any, clientName?: string) {
    const { applyFilters } = require("../utils/filterHelper");
    const { Op } = require("sequelize");
    const { where, limit, offset, order, pagination } = applyFilters(
      query,
      [
        "quote_id",
        "lead_id",
        "product_id",
        "quote_reference",
        "quote_type",
        "quote_status",
        "quote_version",
        "total_premium",
        "premium_frequency",
        "pricing_reference",
        "quote_generated_at",
        "quote_expiry_date",
        "employer_accepted_at",
        "employer_accepted_by_otp",
        "rma_member_number",
        "is_permanent_employees",
        "is_actively_at_work",
        "is_replacing_policy",
        "replaced_policy_includes_disability",
        "is_policy_older_than_6_months",
        "replaced_policy_start_date",
        "province",
      ],
      "createdAt",
      [
        "quote_id",
        "quote_reference", 
        "quote_status", 
        "quote_type",
        "rma_member_number", 
        "province", 
        "pricing_reference",
        "premium_frequency",
        "$lead.lead_reference$",
        "$lead.employer.employer_name$",
        "$lead.employer.registration_number$",
        "$lead.employer.industry_type$",
        "$lead.employer.province$",
      ]
    );

    return await quoteRepo.findAndCountAll({
      where, limit, offset, order,
      include: [
        {
          model: require("../models").BrokerLead,
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
        { model: require("../models").BrokerQuoteBenefit, as: "benefits" },
        { model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" }
      ],
      distinct: true,
      subQuery: false
    });
  }
}
