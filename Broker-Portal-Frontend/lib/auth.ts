import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

/**
 * Check if the stored token is expired or will expire within the buffer time
 * @param bufferSeconds - Number of seconds before expiry to consider token expired (default: 120)
 * @returns true if token is valid, false if expired or missing
 */
export function isTokenValid(bufferSeconds: number = 120): boolean {
  try {
    const token = localStorage.getItem("bp_token");
    if (!token) return false;

    const decoded = jwtDecode<DecodedToken>(token);
    const tokenExpiry = decoded.exp - Math.round(new Date().getTime() / 1000) - bufferSeconds;
    
    return tokenExpiry > 0;
  } catch {
    return false;
  }
}

/**
 * Get the stored token if it's valid, otherwise return null
 */
export function getValidToken(): string | null {
  if (!isTokenValid()) {
    return null;
  }
  return localStorage.getItem("bp_token");
}

/**
 * Clear stored authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem("bp_token");
  localStorage.removeItem("bp_broker_id");
  localStorage.removeItem("bp_representative_id");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
}

/**
 * Redirect to Client Connect for re-authentication
 */
export function redirectToAuth(): void {
  clearAuth();
  const clientConnectUrl = process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL || "http://localhost:4200";
  window.location.href = clientConnectUrl;
}
