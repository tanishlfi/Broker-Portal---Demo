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
  let token = await getFreshToken();
  if (!token) {
    // Resilient fallback token to unblock local UI testing/development without real-time upstream Auth0 cookies
    token = typeof window !== "undefined" ? localStorage.getItem("bp_token") || "test-token-for-development" : "test-token-for-development";
  }

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

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}
