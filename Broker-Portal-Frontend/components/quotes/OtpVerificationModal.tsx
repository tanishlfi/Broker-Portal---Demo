"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { verifyOTP } from "@/lib/api/otp";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => void;
  quoteId?: string;
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  email,
  onVerify,
  quoteId,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!quoteId) {
        throw new Error("Quote ID is required for OTP verification");
      }

      await verifyOTP({
        quoteId: quoteId,
        otpCode: otpValue,
      });

      onVerify(otpValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
      console.error("Error verifying OTP:", err);
      // Reset OTP on error
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(11, 11, 11, 0.72)",
        backdropFilter: "blur(10.5px)",
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="flex flex-col gap-6 p-6"
        style={{
          width: "440px",
          background: "var(--card-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "30px",
              letterSpacing: "-0.449219px",
              color: "var(--text-primary)",
            }}
          >
            Enter OTP
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6"
          >
            <X size={24} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "15.7764px",
            lineHeight: "19px",
            color: "var(--text-secondary)",
          }}
        >
          Enter the 6-digit code sent to {email}
        </p>

        {/* OTP Form */}
        <div className="flex flex-col gap-4">
          {/* Label */}
          <label
            style={{
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "14px",
              letterSpacing: "-0.150391px",
              color: "var(--text-primary)",
            }}
          >
            Enter OTP
          </label>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                color: "#EF4444",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className="flex gap-2 w-full">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="text-center font-bold text-sm focus:outline-none"
                style={{
                  width: "57.13px",
                  height: "42px",
                  background: "var(--input)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "text",
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={otp.join("").length !== 6 || isLoading}
            className="w-full h-9 rounded-lg transition-opacity"
            style={{
              background: otp.join("").length === 6 && !isLoading ? "#1FC3EB" : "var(--border)",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              letterSpacing: "-0.150391px",
              color: otp.join("").length === 6 && !isLoading ? "#0A0A0A" : "var(--text-secondary)",
              opacity: otp.join("").length === 6 && !isLoading ? 1 : 0.5,
              cursor: otp.join("").length === 6 && !isLoading ? "pointer" : "not-allowed",
            }}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
