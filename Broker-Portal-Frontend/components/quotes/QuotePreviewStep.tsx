"use client";

import React from "react";

interface QuotePreviewProps {
  companyName: string;
  registrationNumber: string;
  employeeCount: number;
  averageAge: string;
  averageIncome: string;
  genderSplit: string;
  province: string;
  industry: string;
}

export function QuotePreviewStep({
  companyName,
  registrationNumber,
  employeeCount,
  averageAge,
  averageIncome,
  genderSplit,
  province,
  industry,
}: QuotePreviewProps) {
  const monthlyPremium = 13310;
  const coverageAmount = 14400000;
  const deductible = 40000;
  const lifeCover = 0.5;
  const funeralCover = 20000;

  const fmt = (v: number) => "R " + v.toLocaleString("en-ZA", { minimumFractionDigits: 2 });

  const sectionHeading: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#1FC3EB",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "10px",
  };
  const fieldLabel: React.CSSProperties = { fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" };
  const fieldValue: React.CSSProperties = { fontSize: "0.8125rem", color: "#ffffff", fontWeight: 500 };
  const divider: React.CSSProperties = { borderTop: "1px solid #30363D", margin: "12px 0" };

  return (
    <div
      style={{
        background: "#1E1E1E",
        border: "0.63px solid #30363D",
        borderRadius: "10px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff" }}>Quote Details</span>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            color: "#9ca3af",
            fontSize: "0.8125rem",
            cursor: "pointer",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      </div>

      <div style={divider} />

      {/* Company Details */}
      <div>
        <p style={sectionHeading}>Company Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <p style={fieldLabel}>Company Name</p>
            <p style={fieldValue}>{companyName}</p>
          </div>
          <div>
            <p style={fieldLabel}>Registration Number</p>
            <p style={fieldValue}>{registrationNumber}</p>
          </div>
        </div>
      </div>

      <div style={divider} />

      {/* Quote Details */}
      <div>
        <p style={sectionHeading}>Quote Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "10px" }}>
          <div>
            <p style={fieldLabel}>Employees Covered</p>
            <p style={fieldValue}>{employeeCount}</p>
          </div>
          <div>
            <p style={fieldLabel}>Average Age</p>
            <p style={fieldValue}>{averageAge}</p>
          </div>
          <div>
            <p style={fieldLabel}>Average Income</p>
            <p style={fieldValue}>{averageIncome}</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <p style={fieldLabel}>Gender Split</p>
            <p style={fieldValue}>{genderSplit}</p>
          </div>
          <div>
            <p style={fieldLabel}>Province</p>
            <p style={fieldValue}>{province}</p>
          </div>
          <div>
            <p style={fieldLabel}>Industry</p>
            <p style={fieldValue}>{industry}</p>
          </div>
        </div>
      </div>

      <div style={divider} />

      {/* Premium Details */}
      <div>
        <p style={sectionHeading}>Premium Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <p style={fieldLabel}>Estimated Monthly Premium</p>
            <p style={{ ...fieldValue, color: "#1FC3EB", fontSize: "1rem" }}>{fmt(monthlyPremium)}</p>
          </div>
          <div>
            <p style={fieldLabel}>Total Coverage Amount</p>
            <p style={fieldValue}>{fmt(coverageAmount)}</p>
          </div>
          <div>
            <p style={fieldLabel}>Deductible</p>
            <p style={fieldValue}>{fmt(deductible)}</p>
          </div>
        </div>
      </div>

      <div style={divider} />

      {/* Coverage Details */}
      <div>
        <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>
          Coverage Details
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#2a2a2a", border: "1px solid #30363D", borderRadius: "8px", padding: "14px" }}>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "4px" }}>Life Cover</p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
              R {lifeCover}x monthly salary
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Avg of R 9,000.00 per employee</p>
          </div>
          <div style={{ background: "#2a2a2a", border: "1px solid #30363D", borderRadius: "8px", padding: "14px" }}>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "4px" }}>Funeral Cover</p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
              R {funeralCover.toLocaleString("en-ZA")}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>per employee</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotePreviewStep;
