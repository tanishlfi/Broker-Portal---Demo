"use client";

import { X } from "lucide-react";

interface CancelQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  onConfirm: () => void;
}

export default function CancelQuoteModal({
  isOpen,
  onClose,
  quoteId,
  onConfirm,
}: CancelQuoteModalProps) {
  if (!isOpen) return null;

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
            Cancel Quote
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6"
          >
            <X size={24} color="#E3E3E3" />
          </button>
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.150391px",
            color: "#FFFFFF",
          }}
        >
          Are your sure you want to cancel the selected quote "{quoteId}"?
        </p>

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
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "#1FC3EB",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0A0A0A",
            }}
          >
            Yes, Cancel Quote
          </button>
        </div>
      </div>
    </div>
  );
}
