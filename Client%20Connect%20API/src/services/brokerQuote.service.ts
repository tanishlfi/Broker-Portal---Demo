const { sequelize, BrokerEmployee } = require("../models");
import { BrokerQuoteRepository } from "../repositories/brokerQuote.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { PricingHelper } from "../utils/pricingHelper";
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
      return { quoteId: quote.quote_id, quoteReference: quote.quote_reference, pricing: pricingResult };
    } catch (error) {
      await t.rollback();
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
      return { quoteId: quote.quote_id, quoteReference: quote.quote_reference, pricing: pricingResult, employeeCount: employees_list.length };
    } catch (error) {
      await t.rollback();
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
      return details;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getQuotesByLead(leadId: string, query: any) {
    const { applyFilters } = require("../utils/filterHelper");
    const { where, limit, offset, order, pagination } = applyFilters(query, ["quote_status", "quote_type", "quote_reference"]);
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
        { model: require("../models").BrokerLead, as: "lead" }
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
      await quoteRepo.update(quoteId, { quote_status: "Generated" }, t);

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

  async updateQuoteStatus(quoteId: string, status: string) {
    const quote = await quoteRepo.findById(quoteId);
    if (!quote) throw new Error("Quote not found");

    await quoteRepo.update(quoteId, { quote_status: status });
    return await quoteRepo.findById(quoteId);
  }

  async getQuotesByRepresentative(representativeId: string, query: any, clientName?: string) {
    const { applyFilters } = require("../utils/filterHelper");
    const { Op } = require("sequelize");
    const { where, limit, offset, order, pagination } = applyFilters(query, ["quote_status", "quote_type", "quote_reference"]);

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
      distinct: true
    });
  }
}
