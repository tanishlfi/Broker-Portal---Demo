import { getFreshToken } from "@/lib/auth";

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL          // server-side: direct
    : "/brokerPortal/api/cc";                  // client-side: through Next.js rewrite

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/**
 * Central API client — automatically attaches a fresh auth token to every request.
 * All API files should use this instead of raw fetch.
 */
export async function apiClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = await getFreshToken();
  if (!token) throw new Error("Session expired. Please log in again.");

  const isFormData = options.body instanceof FormData;
  
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 304) return { success: true, data: [] } as unknown as T;

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    // If not JSON, but status is OK, this is unexpected
    if (res.ok) throw new Error("Unexpected non-JSON response from server");
    // If not JSON and status is error, use the raw text as error message
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  
  return data;
}
