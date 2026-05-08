"use client";

import { X, RotateCcw } from "lucide-react";

interface PaymentAttempt {
  attemptNumber: number;
  date: string;
  status: "Failed" | "Pending";
  reason: string;
}

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    invoiceNumber: string;
    policyNumber: string;
    companyName: string;
    premium: string;
    dueDate: string;
    paymentMethod: string;
    failureReason: string;
    attempts: number;
  };
}

const mockPaymentAttempts: PaymentAttempt[] = [
  {
    attemptNumber: 1,
    date: "01/04/2026",
    status: "Failed",
    reason: "Insufficient funds",
  },
  {
    attemptNumber: 2,
    date: "03/04/2026",
    status: "Failed",
    reason: "Insufficient funds",
  },
];

export default function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(11, 11, 11, 0.72)",
        backdropFilter: "blur(10.5px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg overflow-hidden"
        style={{
          background: "#1E1E1E",
          border: "0.625px solid #4A4A4A",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 border-b"
          style={{
            borderColor: "#4A4A4A",
          }}
        >
          <div>
            <h2 className="text-xl font-medium mb-2" style={{ color: "#FFFFFF" }}>
              Invoice Details
            </h2>
            <p style={{ color: "#A0A0A0", fontSize: "14px" }}>
              Detailed breakdown of the failed payment transaction
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            style={{ color: "#A0A0A0" }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {/* Invoice Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Invoice Number */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: "rgba(58, 58, 58, 0.5)",
                border: "0.625px solid #4A4A4A",
              }}
            >
              <p
                className="text-xs font-medium mb-2 uppercase"
                style={{ color: "#A0A0A0", letterSpacing: "0.3px" }}
              >
                Invoice Number
              </p>
              <p
                className="text-xl font-mono"
                style={{ color: "#FFFFFF" }}
              >
                {invoice.invoiceNumber}
              </p>
            </div>

            {/* Policy Number */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: "rgba(58, 58, 58, 0.5)",
                border: "0.625px solid #4A4A4A",
              }}
            >
              <p
                className="text-xs font-medium mb-2 uppercase"
                style={{ color: "#A0A0A0", letterSpacing: "0.3px" }}
              >
                Policy Number
              </p>
              <p
                className="text-xl font-mono"
                style={{ color: "#FFFFFF" }}
              >
                {invoice.policyNumber}
              </p>
            </div>

            {/* Amount Due */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: "rgba(58, 58, 58, 0.5)",
                border: "0.625px solid #4A4A4A",
              }}
            >
              <p
                className="text-xs font-medium mb-2 uppercase"
                style={{ color: "#A0A0A0", letterSpacing: "0.3px" }}
              >
                Amount Due
              </p>
              <p
                className="text-xl"
                style={{ color: "#00B8DB" }}
              >
                {invoice.premium}
              </p>
            </div>

            {/* Due Date */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: "rgba(58, 58, 58, 0.5)",
                border: "0.625px solid #4A4A4A",
              }}
            >
              <p
                className="text-xs font-medium mb-2 uppercase"
                style={{ color: "#A0A0A0", letterSpacing: "0.3px" }}
              >
                Due Date
              </p>
              <p
                className="text-xl"
                style={{ color: "#FFFFFF" }}
              >
                {invoice.dueDate}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              background: "rgba(58, 58, 58, 0.5)",
              border: "0.625px solid #4A4A4A",
            }}
          >
            <p
              className="text-xs font-medium mb-2 uppercase"
              style={{ color: "#A0A0A0", letterSpacing: "0.3px" }}
            >
              Payment Method
            </p>
            <p style={{ color: "#FFFFFF" }}>
              {invoice.paymentMethod}
            </p>
          </div>

          {/* Failure Reason */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "0.625px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <p
              className="text-xs font-medium mb-2 uppercase"
              style={{ color: "#EF4444", letterSpacing: "0.3px" }}
            >
              Failure Reason
            </p>
            <p
              className="text-xl mb-2"
              style={{ color: "#FFFFFF" }}
            >
              {invoice.failureReason}
            </p>
            <p
              className="text-sm italic"
              style={{ color: "#A0A0A0" }}
            >
              Failed after {invoice.attempts} attempts.
            </p>
          </div>

          {/* Payment Attempt History */}
          <div className="mb-6">
            <h3
              className="text-sm font-medium mb-4 uppercase"
              style={{ color: "#A0A0A0", letterSpacing: "0.2px" }}
            >
              Payment Attempt History
            </h3>

            <div className="space-y-3">
              {mockPaymentAttempts.map((attempt) => (
                <div
                  key={attempt.attemptNumber}
                  className="flex items-start justify-between p-4 rounded-lg"
                  style={{
                    background: "rgba(58, 58, 58, 0.3)",
                    border: "0.625px solid #4A4A4A",
                  }}
                >
                  <div>
                    <p
                      className="font-medium mb-1"
                      style={{ color: "#FFFFFF" }}
                    >
                      {attempt.attemptNumber === 1 ? "1st" : "2nd"} Attempt
                    </p>
                    <p style={{ color: "#A0A0A0", fontSize: "14px" }}>
                      {attempt.date}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
                      style={{
                        background: "#EF4444",
                        color: "#FFFFFF",
                      }}
                    >
                      {attempt.status}
                    </span>
                    <p
                      className="text-sm italic"
                      style={{ color: "#A0A0A0" }}
                    >
                      {attempt.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-6 border-t"
          style={{
            borderColor: "#4A4A4A",
          }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: "rgba(58, 58, 58, 0.3)",
              border: "0.625px solid #3A3A3A",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(58, 58, 58, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(58, 58, 58, 0.3)";
            }}
          >
            Close
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: "#00B8DB",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0099B8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#00B8DB";
            }}
          >
            <RotateCcw size={16} />
            <span>Retry Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
