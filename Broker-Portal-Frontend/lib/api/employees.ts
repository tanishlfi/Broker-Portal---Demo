import { apiClient } from "./apiClient";

export interface ImportEmployeesPayload {
  lead_id: string;
  employees: any[];
}

export async function importEmployees(
  payload: ImportEmployeesPayload
): Promise<{ success: boolean; data: any }> {
  return apiClient("/broker/employees/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
