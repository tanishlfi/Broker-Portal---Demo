const { sequelize, BrokerEmployee } = require("../models");
import { BrokerQuoteRepository } from "../repositories/brokerQuote.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { PricingHelper } from "../utils/pricingHelper";
import { AuditService } from "./auditService";
import { AuditEventType, ActionOutcome, LeadStatus, QuoteStatus, QuoteType } from "../enums/brokerPortalEnums";
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
        quote_type: QuoteType.QUICK,
        quote_status: QuoteStatus.DRAFT,
        quote_version: 1,
        province: data.province,
      }, t);

      const pricingResult = await PricingHelper.calculateQuotePricing({
        quote_id: quote.quote_id,
        quote_type: QuoteType.QUICK,
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
        metadata: { quoteType: QuoteType.QUICK, leadId: data.lead_id, quoteId: quote.quote_id },
        ipAddress: data.ipAddress
      });

      return { quoteId: quote.quote_id, quoteReference: quote.quote_reference, pricing: pricingResult };
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteType: QuoteType.QUICK, error: error.message },
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
        quote_type: QuoteType.FULL,
        quote_status: QuoteStatus.DRAFT,
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
        quote_type: QuoteType.FULL,
        product_id: data.product_id,
        benefits: data.benefits,
        employees_list: employees_list.length > 0 ? employees_list : undefined
      }, t);

      // Only update Quote status. Lead Status update removed.
      await quoteRepo.update(quote.quote_id, { quote_status: QuoteStatus.GENERATED }, t);

      await t.commit();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.SUCCESS,
        userId: data.representativeId,
        metadata: { quoteType: QuoteType.FULL, leadId: data.lead_id, quoteId: quote.quote_id, employeeCount: employees_list.length },
        ipAddress: data.ipAddress
      });

      return { quoteId: quote.quote_id, quoteReference: quote.quote_reference, pricing: pricingResult, employeeCount: employees_list.length };
    } catch (error: any) {
      await t.rollback();

      await AuditService.logEvent({
        eventType: AuditEventType.QUOTE_GENERATED,
        outcome: ActionOutcome.FAILURE,
        userId: data.representativeId || "UNKNOWN",
        metadata: { quoteType: QuoteType.FULL, error: error.message },
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

      // Lead Status update removed to follow "Frontend driven" rule.
      await quoteRepo.update(quote.quote_id, { quote_status: QuoteStatus.GENERATED }, t);

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async repriceQuote(quoteId: string, benefits: any) {
    const t = await sequelize.transaction();
    try {
      const quote = await quoteRepo.findOne({
        where: { quote_id: quoteId },
        include: [
          { model: require("../models").BrokerQuoteBenefit, as: "benefits" },
          { model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" }
        ],
        transaction: t
      });

      if (!quote) throw new Error("Quote not found");

      const pricingResult = await PricingHelper.calculateQuotePricing({
        quote_id: quote.quote_id,
        quote_type: quote.quote_type,
        quick_quote_data: quote.quick_quote_data,
        benefits: benefits || quote.benefits,
      }, t);

      // Lead Status update removed to follow "Frontend driven" rule.
      await quoteRepo.update(quote.quote_id, { quote_status: QuoteStatus.REVISED }, t);
      
      await t.commit();
      return pricingResult;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateQuote(quoteId: string, data: any) {
    const t = await sequelize.transaction();
    try {
      const quote = await quoteRepo.findById(quoteId, {
        include: [{ model: require("../models").BrokerQuickQuoteData, as: "quick_quote_data" }]
      });
      if (!quote) throw new Error("Quote not found");

      const {
        quoteType,
        quoteStatus,
        workforceCount,
        averageAge,
        averageSalaryQuickQuote,
        rmaMemberNumber,
        isPermanentEmployees,
        isActivelyAtWork,
        isReplacingPolicy,
        replacedPolicyIncludesDisability,
        isPolicyOlderThan6Months,
        replacedPolicyStartDate,
        province,
        industry,
        genderSplit,
        totalPremium,
        pricingReference,
        benefits,
        productId,
        premiumFrequency,
        quoteExpiryDate,
        quoteGeneratedAt,
        onboardingDetails
      } = data;

      // 1. Update Header / Full Quote Data
      const headerUpdates: any = {};
      if (quoteType !== undefined) headerUpdates.quote_type = quoteType;
      if (quoteStatus !== undefined) headerUpdates.quote_status = quoteStatus;
      if (productId !== undefined) headerUpdates.product_id = productId;
      if (rmaMemberNumber !== undefined) headerUpdates.rma_member_number = rmaMemberNumber;
      if (isPermanentEmployees !== undefined) headerUpdates.is_permanent_employees = isPermanentEmployees;
      if (isActivelyAtWork !== undefined) headerUpdates.is_actively_at_work = isActivelyAtWork;
      if (isReplacingPolicy !== undefined) headerUpdates.is_replacing_policy = isReplacingPolicy;
      if (replacedPolicyIncludesDisability !== undefined) headerUpdates.replaced_policy_includes_disability = replacedPolicyIncludesDisability;
      if (isPolicyOlderThan6Months !== undefined) headerUpdates.is_policy_older_than_6_months = isPolicyOlderThan6Months;
      if (replacedPolicyStartDate !== undefined) headerUpdates.replaced_policy_start_date = replacedPolicyStartDate;
      if (province !== undefined) headerUpdates.province = province;
      if (totalPremium !== undefined) headerUpdates.total_premium = totalPremium;
      if (pricingReference !== undefined) headerUpdates.pricing_reference = pricingReference;
      if (premiumFrequency !== undefined) headerUpdates.premium_frequency = premiumFrequency;
      if (quoteExpiryDate !== undefined) headerUpdates.quote_expiry_date = quoteExpiryDate;
      if (quoteGeneratedAt !== undefined) headerUpdates.quote_generated_at = quoteGeneratedAt;

      if (Object.keys(headerUpdates).length > 0) {
        await quoteRepo.update(quoteId, headerUpdates, t);
      }

      // 2. Drive Lead Status update based on Quote Status (FULL QUOTE ONLY)
      // This is the ONLY place lead status is updated, based on frontend quoteStatus input.
      if (quoteStatus && (quoteType || quote.quote_type) !== QuoteType.QUICK) {
        const statusMapping: Record<string, LeadStatus> = {
          [QuoteStatus.GENERATED]: LeadStatus.QUOTE_GENERATED,
          [QuoteStatus.REVISED]: LeadStatus.QUOTE_GENERATED,
          [QuoteStatus.AWAITING_EMPLOYER_ACCEPTANCE]: LeadStatus.AWAITING_EMPLOYER_ACCEPTANCE,
          [QuoteStatus.ACCEPTED]: LeadStatus.ACCEPTED,
          [QuoteStatus.ONBOARDING_SUBMITTED]: LeadStatus.ONBOARDING_SUBMITTED,
          [QuoteStatus.REJECTED]: LeadStatus.REJECTED,
          [QuoteStatus.EXPIRED]: LeadStatus.EXPIRED,
        };

        const newLeadStatus = statusMapping[quoteStatus];
        if (newLeadStatus) {
          await leadRepo.update(quote.lead_id, { lead_status: newLeadStatus }, t);
        }
      }

      // 3. Update Quick Quote Data (if applicable)
      if (
        workforceCount !== undefined || 
        averageAge !== undefined || 
        averageSalaryQuickQuote !== undefined || 
        province !== undefined || 
        industry !== undefined || 
        genderSplit !== undefined
      ) {
        const qqUpdates: any = {};
        if (workforceCount !== undefined) qqUpdates.workforce_count = workforceCount;
        if (averageAge !== undefined) qqUpdates.average_age = averageAge;
        if (averageSalaryQuickQuote !== undefined) qqUpdates.average_salary = averageSalaryQuickQuote;
        if (province !== undefined) qqUpdates.province = province;
        if (industry !== undefined) qqUpdates.industry_type = industry;
        if (genderSplit !== undefined) qqUpdates.gender_split = genderSplit;

        if (Object.keys(qqUpdates).length > 0) {
          if (quote.quick_quote_data) {
            await quote.quick_quote_data.update(qqUpdates, { transaction: t });
          } else {
            const { BrokerQuickQuoteData } = require("../models");
            await BrokerQuickQuoteData.create({
              quote_id: quoteId,
              ...qqUpdates
            }, { transaction: t });
          }
        }
      }

      // 4. Update Benefits (if provided)
      if (benefits && Array.isArray(benefits)) {
        const { BrokerQuoteBenefit } = require("../models");
        await BrokerQuoteBenefit.destroy({ where: { quote_id: quoteId }, transaction: t });

        for (const b of benefits) {
          await BrokerQuoteBenefit.create({
            quote_benefit_id: uuidv4(),
            quote_id: quoteId,
            benefit_type: b.benefit_type || b.benefitType,
            benefit_name: b.benefit_name || b.benefitName || b.benefit_type || b.benefitType,
            cover_amount: b.cover_amount || b.coverAmount || b.SelectedBenefitValue || 0,
            premium_rate: b.premium_rate || b.premiumRate || 0,
            premium_amount: b.premium_amount || b.premiumAmount || b.BenefitPremiumAmount || 0,
            is_vaps: b.is_vaps || b.isVaps || false,
            effective_date: b.effective_date || b.effectiveDate || new Date(),
          }, { transaction: t });
        }
      }

      // 5. Update Onboarding Details (if provided)
      if (onboardingDetails) {
        const { BrokerQuoteOnboardingDetail } = require("../models");
        const [details, created] = await BrokerQuoteOnboardingDetail.findOrCreate({
          where: { quote_id: quoteId },
          defaults: { ...onboardingDetails, quote_id: quoteId, lead_id: quote.lead_id },
          transaction: t
        });

        if (!created) {
          await details.update(onboardingDetails, { transaction: t });
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
