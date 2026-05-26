"use client";

import { useState } from "react";
import { X } from "lucide-react";
import OtpVerificationModal from "./OtpVerificationModal";
import { sendOTP } from "@/lib/api/otp";

interface ApproveQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  quoteReference: string;
  companyName: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactMobile?: string;
  onSendOTP: () => void;
}

export default function ApproveQuoteModal({
  isOpen,
  onClose,
  quoteId,
  quoteReference,
  companyName,
  contactFirstName,
  contactLastName,
  contactEmail,
  contactMobile,
  onSendOTP,
}: ApproveQuoteModalProps) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const contactDetails = {
    contactPerson: [contactFirstName, contactLastName].filter(Boolean).join(" ") || "—",
    position: "HR Manager",
    email: contactEmail || "—",
    phone: contactMobile || "—",
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendOTP({
        quoteId: quoteId,
      });
      setShowOtpModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
      console.error("Error sending OTP:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (otp: string) => {
    // OTP verification is handled in OtpVerificationModal
    console.log("OTP verified:", otp);
    setShowOtpModal(false);
    onSendOTP(); // Call parent handler to close approve modal and switch to approved tab
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
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
          width: "407px",
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
            Approve Quote ({quoteReference})
          </h2>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.150391px",
            color: "var(--text-secondary)",
          }}
        >
          An OTP Will be sent to the employer email ID.
        </p>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "var(--border)",
          }}
        />

        {/* Contact Details Section */}
        <div className="flex flex-col gap-3">
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "var(--text-primary)",
            }}
          >
            Contact Details
          </h3>

          <div className="flex flex-col gap-1.5">
            {/* Contact Person */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Contact Person</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                {contactDetails.contactPerson}
              </p>
            </div>

            {/* Position */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Position</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                {contactDetails.position}
              </p>
            </div>

            {/* Email */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Email</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                {contactDetails.email}
              </p>
            </div>

            {/* Phone */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Phone</p>
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                {contactDetails.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "var(--border)",
          }}
        />

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

        {/* Action Buttons */}
        <div className="flex justify-end gap-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
            style={{
              background: "transparent",
              borderColor: "var(--border)",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSendOTP}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg"
            style={{
              background: isLoading ? "#00B8DB" : "#1FC3EB",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0A0A0A",
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Sending OTP..." : "Send OTP to the Lead"}
          </button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={handleCloseOtpModal}
          email={contactDetails.email}
          onVerify={handleVerifyOTP}
          quoteId={quoteId}
        />
      )}
    </div>
  );
}