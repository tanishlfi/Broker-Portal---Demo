const { sequelize, BrokerQuote, BrokerQuoteBenefit, BrokerEmployee, BrokerLead, BrokerEmployer } = require("../models");
import { v4 as uuidv4 } from "uuid";

export class PricingService {
  static async calculateQuotePricing(quoteData: any) {
    const { quote_id, quote_type = "Full" } = quoteData;

    let result;
    if (quote_type === "Quick") {
      result = await this.calculateQuickQuotePricing(quoteData);
    } else {
      result = await this.calculateFullQuotePricing(quoteData);
    }

    if (quote_id) {
      await this.savePricingToDb(quote_id, quote_type, result, quoteData);
    }

    return {
      ...result,
      currency: "ZAR",
      pricing_source: "Pricing Service",
    };
  }

  private static async calculateQuickQuotePricing(data: any) {
    const { quick_quote_data, benefits } = data;
    const employees = quick_quote_data?.workforce_count || data.member_count || 0;
    const avg_age = quick_quote_data?.average_age || 35;
    const avg_salary = quick_quote_data?.average_salary || 0;
    const province = quick_quote_data?.province || "";
    const industry = quick_quote_data?.industry || "";

    const base_rates: Record<string, number> = {
      "LIFE": 0.85,
      "FUNERAL": 0.45,
      "DISABILITY": 0.65
    };

    const age_loading = Math.max(0, (avg_age - 35) * 0.012);

    let risk_factor = 1.0;
    if (["Limpopo", "Eastern Cape", "Mpumalanga"].includes(province)) {
      risk_factor = 1.12;
    }
    if (["Mining", "Construction"].includes(industry)) {
      risk_factor *= 1.18;
    }

    let total_monthly_premium = 0;
    const calculatedBenefits = [];

    const benefitsToProcess = benefits || [];
    for (const b of benefitsToProcess) {
      const code = b.benefit_type?.toUpperCase() || "LIFE";
      const cover_value = b.cover_amount || (avg_salary);
      const rate = base_rates[code] || 0.85;

      const premium = (employees * cover_value * rate / 1000) * (1 + age_loading) * risk_factor;

      total_monthly_premium += premium;

      calculatedBenefits.push({
        ...b,
        premium_rate: rate * (1 + age_loading) * risk_factor,
        premium_amount: Math.round(premium * 100) / 100,
      });
    }

    return {
      total_premium: Math.round(total_monthly_premium * 100) / 100,
      per_employee_monthly: employees > 0 ? Math.round((total_monthly_premium / employees) * 100) / 100 : 0,
      benefits: calculatedBenefits,
    };
  }

  private static async calculateFullQuotePricing(data: any) {
    const { quote_id, benefits } = data;
    
    let employees = data.employees_list;
    
    if (!employees && quote_id) {
      const quote = await BrokerQuote.findByPk(quote_id, {
        include: [{ 
          model: BrokerLead, 
          as: "lead",
          include: [{ model: BrokerEmployee, as: "employees" }]
        }]
      });
      employees = quote?.lead?.employees || [];
    }

    if (!employees || employees.length === 0) {
      return this.calculateQuickQuotePricing(data);
    }

    let total_monthly = 0;
    const benefitTotals: Record<string, any> = {};

    for (const emp of employees) {
      const dob = emp.date_of_birth;
      const age = dob ? this.calculateAge(dob) : 35;
      const salary = emp.salary || 0;

      for (const b of benefits) {
        const code = b.benefit_type?.toUpperCase() || "LIFE";
        const multiple = b.multiple || 3;
        const fixed_cover = b.cover_amount || 0;
        const cover = fixed_cover > 0 ? fixed_cover : (multiple * salary);

        const rate = this.getIndividualRate(code, age, salary);
        const emp_premium = (cover * rate / 1000); 

        total_monthly += emp_premium;

        if (!benefitTotals[code]) {
          benefitTotals[code] = { ...b, premium_amount: 0, total_cover: 0 };
        }
        benefitTotals[code].premium_amount += emp_premium;
        benefitTotals[code].total_cover += cover;
      }
    }

    const calculatedBenefits = Object.values(benefitTotals).map(b => ({
      ...b,
      premium_amount: Math.round(b.premium_amount * 100) / 100,
    }));

    return {
      total_premium: Math.round(total_monthly * 100) / 100,
      per_employee_monthly: Math.round((total_monthly / employees.length) * 100) / 100,
      benefits: calculatedBenefits,
    };
  }

  private static calculateAge(dob: string | Date) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private static getIndividualRate(code: string, age: number, salary: number) {
    const base_rates: Record<string, number> = {
      "LIFE": 0.85,
      "FUNERAL": 0.45,
      "DISABILITY": 0.65
    };
    const rate = base_rates[code] || 0.85;
    const age_loading = Math.max(0, (age - 35) * 0.012);
    return rate * (1 + age_loading);
  }

  private static async savePricingToDb(quote_id: string, quote_type: string, result: any, originalData: any) {
    const { quick_quote_data } = originalData;

    if (quote_type === "Quick" && quick_quote_data) {
      const { BrokerQuickQuoteData } = require("../models");
      await BrokerQuickQuoteData.upsert({
        quote_id,
        workforce_count: quick_quote_data.workforce_count,
        average_age: quick_quote_data.average_age,
        average_salary: quick_quote_data.average_salary,
        province: quick_quote_data.province,
        industry_type: quick_quote_data.industry,
        gender_split: quick_quote_data.gender_split,
      });
    }

    await BrokerQuoteBenefit.destroy({ where: { quote_id } });

    for (const cb of result.benefits) {
      await BrokerQuoteBenefit.create({
        quote_benefit_id: uuidv4(),
        quote_id,
        benefit_type: cb.benefit_type,
        benefit_name: cb.benefit_name,
        cover_amount: cb.cover_amount || cb.total_cover || 0,
        premium_rate: cb.premium_rate || 0,
        premium_amount: cb.premium_amount,
        is_vaps: cb.is_vaps || false,
        effective_date: new Date(),
      });
    }

    await BrokerQuote.update(
      { 
        total_premium: result.total_premium,
        quote_type: quote_type,
        product_id: originalData.product_id || undefined,
        quote_status: "Generated"
      },
      { where: { quote_id } }
    );
  }
}
