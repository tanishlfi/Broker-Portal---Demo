const { sequelize, BrokerQuote, BrokerQuoteBenefit, BrokerEmployee, BrokerLead, BrokerEmployer } = require("../models");
import { v4 as uuidv4 } from "uuid";

export class PricingHelper {
  private static readonly MAX_BENEFIT = 2000000;
  private static readonly BASE_AGE = 35;
  private static readonly AGE_LOADING_RATE = 0.012;
  
  private static readonly BASE_RATES: Record<string, number> = {
    "LIFE": 0.576,
    "DISABILITY": 0.527,
    "FUNERAL": 1.05,
    "OCCUPATIONAL DISABILITY": 0.527
  };

  private static readonly ADDON_RATES: Record<string, number> = {
    "COMMUTING JOURNEY": 48.00,
    "RIOT AND STRIKE": 5.00
  };

  private static readonly HIGH_RISK_INDUSTRIES = [
    "Mining", "Construction", "Explosives", "Oil & Gas", "Security", "Fishing"
  ];

  private static getFreeCoverLimit(employeeCount: number): number {
    return employeeCount >= 50 ? 1000000 : 500000;
  }
  static async calculateQuotePricing(quoteData: any, transaction?: any) {
    const { quote_id, quote_type = "Full" } = quoteData;

    let result;
    if (quote_type === "Quick") {
      result = await this.calculateQuickQuotePricing(quoteData);
    } else {
      result = await this.calculateFullQuotePricing(quoteData, transaction);
    }

    if (quote_id) {
      await this.savePricingToDb(quote_id, quote_type, result, quoteData, transaction);
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
    const avg_age = quick_quote_data?.average_age || this.BASE_AGE;
    const avg_salary = quick_quote_data?.average_salary || 0;
    const province = quick_quote_data?.province || "";
    const industry = quick_quote_data?.industry || "";

    const fcl = this.getFreeCoverLimit(employees);
    const isHighRisk = this.HIGH_RISK_INDUSTRIES.some(i => industry.includes(i));

    const age_loading = Math.max(0, (avg_age - this.BASE_AGE) * this.AGE_LOADING_RATE);

    let risk_factor = 1.0;
    if (["Limpopo", "Eastern Cape", "Mpumalanga"].includes(province)) {
      risk_factor = 1.12;
    }
    if (isHighRisk) {
      risk_factor *= 1.18;
    }

    let total_monthly_premium = 0;
    const calculatedBenefits = [];

    const benefitsToProcess = benefits || [];
    for (const b of benefitsToProcess) {
      const code = b.benefit_type?.toUpperCase() || "LIFE";
      
      // Block Disability for high-risk in Quick Quote
      if (isHighRisk && (code === "DISABILITY" || code === "OCCUPATIONAL DISABILITY")) {
        continue;
      }

      let cover_value = b.cover_amount || 0;
      if (b.multiple && avg_salary > 0) {
          cover_value = (avg_salary * 12) * b.multiple;
      }
      
      // Apply Cap
      if (code === "LIFE" || code === "DISABILITY" || code === "OCCUPATIONAL DISABILITY") {
          cover_value = Math.min(cover_value, this.MAX_BENEFIT);
      }

      const rate = this.BASE_RATES[code] || 0.576;
      const addonRate = this.ADDON_RATES[code] || 0;

      let premium = 0;
      if (addonRate > 0) {
        premium = employees * addonRate;
      } else {
        premium = (employees * cover_value * rate / 1000) * (1 + age_loading) * risk_factor;
      }

      total_monthly_premium += premium;

      calculatedBenefits.push({
        ...b,
        benefit_name: b.benefit_name || b.benefit_type,
        cover_amount: Math.round(cover_value),
        premium_rate: addonRate > 0 ? addonRate : rate * (1 + age_loading) * risk_factor,
        premium_amount: Math.round(premium * 100) / 100,
        requires_medical: cover_value > fcl && addonRate === 0
      });
    }

    return {
      total_premium: Math.round(total_monthly_premium * 100) / 100,
      per_employee_monthly: employees > 0 ? Math.round((total_monthly_premium / employees) * 100) / 100 : 0,
      benefits: calculatedBenefits,
      fcl_applied: fcl
    };
  }

  private static async calculateFullQuotePricing(data: any, transaction?: any) {
    const { quote_id, benefits } = data;
    
    const quote = await BrokerQuote.findByPk(quote_id, {
      include: [{ 
        model: BrokerLead, 
        as: "lead",
        include: [
          { model: BrokerEmployee, as: "employees" },
          { model: BrokerEmployer, as: "employer" }
        ]
      }],
      transaction
    });

    const employees_to_process = quote?.lead?.employees || data.employees_list || [];
    const employer = quote?.lead?.employer;
    
    if (!employees_to_process || employees_to_process.length === 0) {
      return this.calculateQuickQuotePricing(data);
    }

    const fcl = this.getFreeCoverLimit(employees_to_process.length);
    const province = employer?.province || "";

    let riskFactor = 1.0;
    if (["Limpopo", "Eastern Cape", "Mpumalanga"].includes(province)) {
      riskFactor = 1.12;
    }

    let total_monthly = 0;
    const benefitTotals: Record<string, any> = {};

    for (const emp of employees_to_process) {
      const age = emp.date_of_birth ? this.calculateAge(emp.date_of_birth) : 35;
      const salary = emp.salary || 0;
      const annualSalary = salary * 12;

      for (const b of benefits) {
        const code = b.benefit_type?.toUpperCase() || "LIFE";
        
        let cover = b.cover_amount || 0;
        if (b.multiple && annualSalary > 0) {
          cover = annualSalary * b.multiple;
        }

        // Apply Hard Cap
        if (code === "LIFE" || code === "DISABILITY" || code === "OCCUPATIONAL DISABILITY") {
          cover = Math.min(cover, this.MAX_BENEFIT);
        }

        const rate = this.getIndividualRate(code, age, riskFactor);
        const emp_premium = (cover * rate / 1000); 

        total_monthly += emp_premium;

        if (!benefitTotals[code]) {
          benefitTotals[code] = { 
            ...b, 
            benefit_name: b.benefit_name || b.benefit_type,
            premium_amount: 0, 
            total_cover: 0,
            requires_medical: false
          };
        }
        benefitTotals[code].premium_amount += emp_premium;
        benefitTotals[code].total_cover += cover;
        
        if (cover > fcl) {
          benefitTotals[code].requires_medical = true;
        }
      }
    }

    const calculatedBenefits = Object.values(benefitTotals).map(b => ({
      ...b,
      premium_amount: Math.round(b.premium_amount * 100) / 100,
    }));

    return {
      total_premium: Math.round(total_monthly * 100) / 100,
      per_employee_monthly: employees_to_process.length > 0 ? Math.round((total_monthly / employees_to_process.length) * 100) / 100 : 0,
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

  private static getIndividualRate(code: string, age: number, riskFactor: number = 1.0) {
    const baseRate = this.BASE_RATES[code] || 0.576;
    const addonRate = this.ADDON_RATES[code] || 0;

    if (addonRate > 0) return addonRate; // Addons are flat rates

    const age_loading = Math.max(0, (age - this.BASE_AGE) * this.AGE_LOADING_RATE);
    return baseRate * (1 + age_loading) * riskFactor;
  }

  private static async savePricingToDb(quote_id: string, quote_type: string, result: any, originalData: any, transaction?: any) {
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
      }, { transaction });
    }

    await BrokerQuoteBenefit.destroy({ where: { quote_id }, transaction });

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
      }, { transaction });
    }

    await BrokerQuote.update(
      { 
        total_premium: result.total_premium,
        quote_type: quote_type,
        product_id: originalData.product_id || undefined,
        quote_status: "Generated"
      },
      { where: { quote_id }, transaction }
    );
  }
}
