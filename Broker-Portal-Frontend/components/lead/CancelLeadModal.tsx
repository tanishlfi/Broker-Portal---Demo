"use client";

import { X } from "lucide-react";

interface CancelLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leadName?: string;
}

export default function CancelLeadModal({ isOpen, onClose, onConfirm, leadName }: CancelLeadModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          left: 0,
          top: 0,
          background: "rgba(11, 11, 11, 0.72)",
          backdropFilter: "blur(10.5px)",
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "24.6191px 24.6191px 24px",
        gap: "23.99px",
        position: "fixed",
        width: "549px",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        background: "#1E1E1E",
        border: "0.625px solid #4A4A4A",
        borderRadius: "10px",
        zIndex: 1001,
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            lineHeight: "30px",
            letterSpacing: "-0.449219px",
            color: "#FFFFFF",
            margin: 0,
          }}>
            Cancel Lead
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "24px",
              height: "24px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} color="#E3E3E3" />
          </button>
        </div>

        {/* Message */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          width: "100%",
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "14px",
            letterSpacing: "-0.150391px",
            color: "#FFFFFF",
            margin: 0,
          }}>
            Are you sure you want to cancel the lead?
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          width: "100%",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "10px",
          }}>
            {/* No, Go Back Button */}
            <button
              onClick={onClose}
              style={{
                width: "123.5px",
                height: "36px",
                background: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.150391px",
                color: "#1E1E1E",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              No, Go Back
            </button>

            {/* Yes, Cancel Button */}
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                width: "123.5px",
                height: "36px",
                background: "#1FC3EB",
                border: "none",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.150391px",
                color: "#FFFFFF",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
