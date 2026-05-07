"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: (otp: string) => void;
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  email,
  onVerify,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

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

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      // Bypass validation for now - just verify any 6-digit OTP
      onVerify(otpValue);
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
          background: "#1E1E1E",
          border: "0.625px solid #4A4A4A",
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
              color: "#FFFFFF",
            }}
          >
            Enter OTP
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6"
          >
            <X size={24} color="#E3E3E3" />
          </button>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "15.7764px",
            lineHeight: "19px",
            color: "#FFFFFF",
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
              color: "#FFFFFF",
            }}
          >
            Enter OTP
          </label>

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
                className="text-center text-white font-bold text-sm focus:outline-none"
                style={{
                  width: "57.13px",
                  height: "42px",
                  background: "#262626",
                  border: "0.625px solid #363636",
                  borderRadius: "8px",
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={otp.join("").length !== 6}
            className="w-full h-9 rounded-lg transition-opacity"
            style={{
              background: otp.join("").length === 6 ? "#1FC3EB" : "#3A3A3A",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              letterSpacing: "-0.150391px",
              color: "#FFFFFF",
              opacity: otp.join("").length === 6 ? 1 : 0.5,
              cursor: otp.join("").length === 6 ? "pointer" : "not-allowed",
            }}
          >
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}
