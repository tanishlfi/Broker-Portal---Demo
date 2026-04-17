const BASE = process.env.NEXT_PUBLIC_API_URL;

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
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export async function createLead(payload: CreateLeadPayload, token: string) {
  const res = await fetch(`${BASE}/broker/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean; data: { leadId: string; leadReference: string } }>(res);
}
