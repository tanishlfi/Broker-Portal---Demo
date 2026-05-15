import { getValidToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/apirma/v1";

export interface SendOTPRequest {
  referenceId: string;
  referenceType: "Quote" | "Lead";
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    expiresAt: string;
  };
}

export interface VerifyOTPRequest {
  referenceId: string;
  otpCode: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    timestamp: string;
  };
}

/**
 * Send OTP to employer email
 */
export const sendOTP = async (
  request: SendOTPRequest,
  token?: string
): Promise<SendOTPResponse> => {
  const authToken = token || getValidToken() || localStorage.getItem("bp_token");

  // For development/testing: if no token, use a test token
  const finalToken = authToken || "test-token-for-development";

  try {
    const response = await fetch(`${API_BASE_URL}/broker/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${finalToken}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

/**
 * Verify OTP and trigger onboarding
 */
export const verifyOTP = async (
  request: VerifyOTPRequest,
  token?: string
): Promise<VerifyOTPResponse> => {
  const authToken = token || getValidToken() || localStorage.getItem("bp_token");

  // For development/testing: if no token, use a test token
  const finalToken = authToken || "test-token-for-development";

  try {
    const response = await fetch(`${API_BASE_URL}/broker/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${finalToken}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify OTP");
    }

    return data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};
