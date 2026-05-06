const CC_BASE = typeof window === "undefined"
  ? process.env.NEXT_PUBLIC_API_URL   // server-side
  : "/api/cc";                         // client-side: go through Next.js proxy (no CORS)

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

async function handleResponse<T>(res: Response): Promise<T> {
  // 304 Not Modified has no body — treat as empty success
  if (res.status === 304) return { success: true, data: [] } as unknown as T;
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export async function createLead(payload: CreateLeadPayload, token: string) {
  const res = await fetch(`${CC_BASE}/broker/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean; data: { leadId: string; leadReference: string } }>(res);
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
  quoteStatus?: string;
  createdAt: string;
}

export async function getLeads(token: string, representativeId?: string): Promise<Lead[]> {
  // Use provided representativeId, fall back to placeholder used by createLead
  const repId = representativeId || "00000000-0000-0000-0000-000000000000";

  const params = new URLSearchParams({ representativeId: repId });

  const res = await fetch(`${CC_BASE}/broker/leads?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = await handleResponse<{ success: boolean; data: any[] }>(res);

  return (json.data ?? []).map((l: any) => ({
    leadId:             l.lead_id,
    leadReference:      l.lead_reference,
    employerName:       l.employer?.employer_name ?? "",
    registrationNumber: l.employer?.registration_number ?? undefined,
    numberOfEmployees:  l.employer?.number_of_employees ?? 0,
    contactFirstName:   l.contact?.contact_first_name ?? "",
    contactLastName:    l.contact?.contact_last_name ?? "",
    contactEmail:       l.contact?.contact_email ?? "",
    status:             l.lead_status,
    quoteStatus:        l.quotes?.[0]?.quote_status ?? undefined,
    createdAt:          l.lead_created_at ?? l.createdAt,
  }));
}

export async function cancelLead(leadId: string, token: string): Promise<void> {
  try {
    const res = await fetch(`${CC_BASE}/broker/leads/${leadId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Cancel failed");
  } catch {
    // silently fail — UI updates optimistically
  }
}
