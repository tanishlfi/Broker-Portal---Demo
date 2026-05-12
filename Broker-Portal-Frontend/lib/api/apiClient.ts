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

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 304) return { success: true, data: [] } as unknown as T;

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}
