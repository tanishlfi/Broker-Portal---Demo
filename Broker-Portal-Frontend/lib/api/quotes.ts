import { apiClient } from "./apiClient";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QuickQuotePayload {
  lead_id: string;
  workforce_count: number;
  average_age: number;
  average_salary: number;
  province: string;
  industry: string;
  gender_split: string;
  benefits: Array<{ benefit_type: string; cover_amount?: number }>;
}

export interface FullQuotePayload {
  lead_id: string;
  product_id?: string;
  rma_member_number?: string;
  is_permanent_employees?: boolean;
  is_actively_at_work?: boolean;
  is_replacing_policy?: boolean;
  replaced_policy_includes_disability?: boolean;
  is_policy_older_than_6_months?: boolean;
  replaced_policy_start_date?: string;
  province?: string;
  industry?: string;
  generate_options?: boolean;
  benefits: Array<{ benefit_type: string; multiple?: number; cover_amount?: number }>;
  employees?: any[];
  employeeFile?: File;
}

export interface RepricePayload {
  lifeCoverMultiple?: number;
  funeralCoverAmount?: number;
  occupationalDisabilityMultiple?: number;
  additionalBenefits?: string[];
}

export type QuoteStatus =
  | "new"
  | "pending"
  | "approved"
  | "onboarding"
  | "cancelled"
  | "expired";

export interface QuoteStatusPayload {
  status: QuoteStatus;
}

export interface Quote {
  quoteId: string;
  quoteReference: string;
  leadReference: string;
  quoteType: "Quick Quote" | "Full Quote";
  status: QuoteStatus;
  companyName: string;
  registrationNumber?: string;
  numberOfEmployees: number;
  averageAge?: number;
  averageMonthlyIncome?: number;
  genderSplit?: string;
  province?: string;
  industry?: string;
  monthlyPremium: number;
  coverageAmount: number;
  lifeCover?: number;
  funeralCover?: number;
  occupationalDisability?: number;
  scheme?: string;
  benefits?: string[];
  valueAddedServices?: string[];
  deductible?: number;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactMobile?: string;
  validUntilDays?: number;
  createdAt: string;
}

// ── API functions ──────────────────────────────────────────────────────────────

/** POST /broker/quotes/quick — generate a quick quote from average workforce data */
export async function createQuickQuote(
  payload: QuickQuotePayload
): Promise<{ success: boolean; data: Quote }> {
  return apiClient<{ success: boolean; data: Quote }>("/broker/quotes/quick", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /broker/quotes/full — generate a full quote */
export async function createFullQuote(
  payload: FullQuotePayload
): Promise<{ success: boolean; data: Quote }> {
  // If there's a file, we must use FormData
  if (payload.employeeFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "benefits" || key === "employees") {
        formData.append(key, JSON.stringify(value));
      } else if (key === "employeeFile") {
        formData.append("employeeFile", value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return apiClient<{ success: boolean; data: Quote }>("/broker/quotes/full", {
      method: "POST",
      body: formData,
    });
  }

  return apiClient<{ success: boolean; data: Quote }>("/broker/quotes/full", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /broker/quotes/{quoteReference}/reprice — reprice an existing quote with new benefits */
export async function repriceQuote(
  quoteReference: string,
  payload: RepricePayload
): Promise<{ success: boolean; data: Quote }> {
  return apiClient<{ success: boolean; data: Quote }>(`/broker/quotes/${quoteReference}/reprice`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /broker/quotes/{quoteReference} — get details of a specific quote */
export async function getQuote(
  quoteReference: string
): Promise<{ success: boolean; data: Quote }> {
  return apiClient<{ success: boolean; data: Quote }>(`/broker/quotes/${quoteReference}`, { cache: "no-store" });
}

/** GET /broker/quotes — get all quotes */
export async function getQuotes(): Promise<{ success: boolean; data: Quote[] }> {
  const res = await apiClient<{ success: boolean; data: any[] }>(`/broker/quotes`, { cache: "no-store" });
  if (res?.success && Array.isArray(res?.data)) {
    return {
      success: true,
      data: res.data.map(normaliseQuote),
    };
  }
  return { success: false, data: [] };
}

/** PATCH /broker/quotes/{quoteId}/status — update the status of a quote */
export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus
): Promise<{ success: boolean; data: Quote }> {
  return apiClient<{ success: boolean; data: Quote }>(`/broker/quotes/${quoteId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status } satisfies QuoteStatusPayload),
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Map raw API response to a normalised Quote object */
export function normaliseQuote(raw: any): Quote {
  // Calculate total coverage amount from associated benefits if available
  let computedCoverage = raw.coverage_amount ?? raw.coverageAmount ?? 0;
  if (!computedCoverage && Array.isArray(raw.benefits)) {
    computedCoverage = raw.benefits.reduce((sum: number, b: any) => sum + (Number(b.cover_amount) || 0), 0);
  }

  // Extract monthly premium from total_premium or benefits sum if available
  let computedPremium = raw.monthly_premium ?? raw.monthlyPremium ?? raw.total_premium ?? raw.totalPremium ?? 0;
  if (!computedPremium && Array.isArray(raw.benefits)) {
    computedPremium = raw.benefits.reduce((sum: number, b: any) => sum + (Number(b.premium_amount) || 0), 0);
  }

  return {
    quoteId:            raw.quote_id        ?? raw.quoteId        ?? "",
    quoteReference:     raw.quote_reference ?? raw.quoteReference ?? "",
    leadReference:      raw.lead_reference  ?? raw.leadReference  ?? raw.lead_id ?? "",
    quoteType:          raw.quote_type?.toLowerCase() === "full" ? "Full Quote" : "Quick Quote",
    status:             raw.quote_status?.toLowerCase() ?? raw.status?.toLowerCase() ?? "new",
    companyName:        raw.lead?.employer?.employer_name ?? raw.employer?.employer_name ?? raw.companyName ?? "Unknown Company",
    registrationNumber: raw.lead?.employer?.registration_number ?? raw.employer?.registration_number ?? raw.registrationNumber,
    numberOfEmployees:  raw.lead?.employer?.number_of_employees ?? raw.number_of_employees ?? raw.numberOfEmployees ?? 0,
    averageAge:         raw.average_age         ?? raw.averageAge,
    averageMonthlyIncome: raw.average_monthly_income ?? raw.averageMonthlyIncome,
    genderSplit:        raw.gender_split    ?? raw.genderSplit,
    province:           raw.province ?? raw.lead?.employer?.province,
    industry:           raw.industry ?? raw.lead?.employer?.industry_type,
    monthlyPremium:     computedPremium,
    coverageAmount:     computedCoverage,
    lifeCover:          raw.life_cover      ?? raw.lifeCover,
    funeralCover:       raw.funeral_cover   ?? raw.funeralCover,
    occupationalDisability: raw.occupational_disability ?? raw.occupationalDisability,
    scheme:             raw.scheme,
    benefits:           raw.benefits,
    valueAddedServices: raw.value_added_services ?? raw.valueAddedServices,
    deductible:         raw.deductible,
    contactFirstName:   raw.lead?.contact?.contact_first_name ?? raw.contact?.contact_first_name ?? raw.contactFirstName,
    contactLastName:    raw.lead?.contact?.contact_last_name  ?? raw.contact?.contact_last_name  ?? raw.contactLastName,
    contactEmail:       raw.lead?.contact?.contact_email      ?? raw.contact?.contact_email      ?? raw.contactEmail,
    contactMobile:      raw.lead?.contact?.contact_mobile     ?? raw.contact?.contact_mobile     ?? raw.contactMobile,
    validUntilDays:     raw.valid_until_days ?? raw.validUntilDays ?? 30,
    createdAt:          raw.createdAt ?? raw.quote_created_at ?? "",
  };
}

/** Format a number as South African Rand string, e.g. "R 26,629" */
export function formatRand(value: number): string {
  return "R " + new Intl.NumberFormat("en-ZA").format(Math.round(value));
}
