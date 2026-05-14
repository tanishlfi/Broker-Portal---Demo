import { apiClient } from "./apiClient";

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
  request: SendOTPRequest
): Promise<SendOTPResponse> => {
  return apiClient<SendOTPResponse>("/broker/otp/send", {
    method: "POST",
    body: JSON.stringify(request),
  });
};

/**
 * Verify OTP and trigger onboarding
 */
export const verifyOTP = async (
  request: VerifyOTPRequest
): Promise<VerifyOTPResponse> => {
  return apiClient<VerifyOTPResponse>("/broker/otp/verify", {
    method: "POST",
    body: JSON.stringify(request),
  });
};
