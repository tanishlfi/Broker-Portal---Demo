import { apiClient } from "./apiClient";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Benefit {
  benefit_id: string;
  product_id: string;
  benefit_name: string;
  benefit_type: "Life" | "Funeral" | "Accident" | "VAPS";
  is_mandatory: boolean;
  is_embedded: boolean;
  default_cover_amount: number;
}

export interface Product {
  product_id: string;
  product_name: string;
  description: string;
  benefits: Benefit[];
}

export interface PricingRequest {
  quote_type?: "Quick" | "Full";
  member_count?: number;
  total_employees?: number; // Keep for backward compatibility if needed
  quick_quote_data?: {
    workforce_count: number;
    average_age: number;
    average_salary: number;
    province: string;
    industry: string;
  };
  products?: {
    product_id: string;
    benefits: {
      benefit_id: string;
      cover_amount: number;
      is_selected: boolean;
    }[];
  }[];
  benefits?: {
    benefit_id?: string;
    benefit_type: string;
    cover_amount: number;
    is_selected?: boolean;
    multiple?: number;
  }[];
}

export interface PricingResponse {
  success: boolean;
  data: {
    total_premium: number;
    total_monthly_premium?: number;
    per_employee_monthly?: number;
    benefits: {
      benefit_id?: string;
      benefit_name: string;
      benefit_type?: string;
      premium_amount: number;
      premium_rate?: number;
      cover_amount?: number;
      requires_medical?: boolean;
    }[];
  };
}

// ── API functions ──────────────────────────────────────────────────────────────

/** GET /product/list — get list of available products */
export async function getProductList(): Promise<Product[]> {
  const json = await apiClient<{ success: boolean; data: Product[] }>(
    "/product/list",
    { cache: "no-store" }
  );
  return json.data;
}

/** POST /product/pricing — calculate pricing for selected products and benefits */
export async function calculatePricing(payload: PricingRequest): Promise<PricingResponse> {
  return apiClient<PricingResponse>("/product/pricing", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
