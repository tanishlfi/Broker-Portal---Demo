import { apiClient } from "./apiClient";

export interface CreateLeadPayload {
  employerName: string;
  registrationNumber?: string;
  industryType: string;
  numberOfEmployees: number;
  province: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactMobile: string;
  preferredCommunicationMethod?: "Email" | "SMS" | "Phone";
  representativeId: string;
  brokerId: string;
}

export interface Lead {
  leadId: string;
  leadReference: string;
  employerName: string;
  registrationNumber?: string;
  numberOfEmployees: number;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  status: string;
  quoteType?: string;
  quoteStatus?: string;
  createdAt: string;
}

export async function createLead(payload: CreateLeadPayload) {
  return apiClient<{ success: boolean; data: { leadId: string; leadReference: string } }>(
    "/broker/leads",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function getLeads(representativeId?: string): Promise<Lead[]> {
  const repId = representativeId || "00000000-0000-0000-0000-000000000000";
  const params = new URLSearchParams({ representativeId: repId, limit: "10000" });

  const json = await apiClient<{ success: boolean; data: any }>(
    `/broker/leads?${params.toString()}`,
    { cache: "no-store" }
  );

  const list = Array.isArray(json.data) ? json.data : (json.data?.leads ?? []);

  return list.map((l: any) => ({
    leadId:             l.lead_id,
    leadReference:      l.lead_reference,
    employerName:       l.employer?.employer_name ?? "",
    registrationNumber: l.employer?.registration_number ?? undefined,
    numberOfEmployees:  l.employer?.number_of_employees ?? 0,
    contactFirstName:   l.contact?.contact_first_name ?? "",
    contactLastName:    l.contact?.contact_last_name ?? "",
    contactEmail:       l.contact?.contact_email ?? "",
    status:             l.lead_status,
    quoteType:          l.quotes?.[0]?.quote_type ? `${l.quotes[0].quote_type} Quote` : undefined,
    quoteStatus:        l.quotes?.[0]?.quote_status ?? undefined,
    createdAt:          l.lead_created_at ?? l.createdAt,
  }));
}

export async function cancelLead(leadId: string, reason: string): Promise<void> {
  const representativeId = localStorage.getItem("bp_broker_id") ?? undefined;
  await apiClient(`/broker/leads/${leadId}/cancel`, { 
    method: "POST",
    body: JSON.stringify({ reason, representativeId })
  });
}
