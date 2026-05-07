"use client";

import { useState } from "react";
import { X } from "lucide-react";
import OtpVerificationModal from "./OtpVerificationModal";

interface ApproveQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  companyName: string;
  onSendOTP: () => void;
}

export default function ApproveQuoteModal({
  isOpen,
  onClose,
  quoteId,
  companyName,
  onSendOTP,
}: ApproveQuoteModalProps) {
  const [showOtpModal, setShowOtpModal] = useState(false);

  if (!isOpen) return null;

  // Mock contact details - in real app, fetch from API
  const contactDetails = {
    contactPerson: "John Doe",
    position: "General HR Manager",
    email: "Johndoe@gmail.com",
    phone: "8282828233",
  };

  const handleSendOTP = () => {
    // In real app, call API to send OTP
    console.log("Sending OTP to:", contactDetails.email);
    setShowOtpModal(true);
  };

  const handleVerifyOTP = (otp: string) => {
    // Bypass validation - accept any 6-digit OTP
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
            Approve Quote ({quoteId})
          </h2>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.150391px",
            color: "#FFFFFF",
          }}
        >
          An OTP Will be sent to the employer email ID.
        </p>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.12)",
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
              color: "#E6E6E6",
            }}
          >
            Contact Details
          </h3>

          <div className="flex flex-col gap-1.5">
            {/* Contact Person */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Contact Person</p>
              <p style={{ fontSize: "14px", color: "#FFFFFF" }}>
                {contactDetails.contactPerson}
              </p>
            </div>

            {/* Position */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Position</p>
              <p style={{ fontSize: "14px", color: "#FFFFFF" }}>
                {contactDetails.position}
              </p>
            </div>

            {/* Email */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Email</p>
              <p style={{ fontSize: "14px", color: "#FFFFFF" }}>
                {contactDetails.email}
              </p>
            </div>

            {/* Phone */}
            <div className="flex justify-between">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Phone</p>
              <p style={{ fontSize: "14px", color: "#FFFFFF" }}>
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
            background: "rgba(255, 255, 255, 0.12)",
          }}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0A0A0A",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSendOTP}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "#1FC3EB",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0A0A0A",
            }}
          >
            Send OTP to the Lead
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
        />
      )}
    </div>
  );
}
