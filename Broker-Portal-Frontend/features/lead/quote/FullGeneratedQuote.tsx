"use client";

import { CheckCircle } from "lucide-react";

interface FullGeneratedQuoteProps {
  coverageAmount: number;
  monthlyPremium: number;
  employeesCovered: number;
  deductible?: number;
  avgSalary: number;
  benefitsIncluded: string;
  validUntilDays?: number;
  onBack: () => void;
  onCustomize: () => void;
  onGenerateDocument: () => void;
}

export default function FullGeneratedQuote({
  coverageAmount,
  monthlyPremium,
  employeesCovered,
  deductible = 10000,
  avgSalary,
  benefitsIncluded,
  validUntilDays = 30,
  onBack,
  onCustomize,
  onGenerateDocument,
}: FullGeneratedQuoteProps) {
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + validUntilDays);
  const formattedDate = validUntilDate.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const fmtAmount = (v: number) =>
    `R ${new Intl.NumberFormat("en-US", { useGrouping: true }).format(v)}`;

  const fmtPremium = (v: number) =>
    `R ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(v)}`;

  const btnOutline: React.CSSProperties = {
    height: "40px",
    padding: "0 20px",
    fontSize: "1rem",
    fontWeight: 500,
    background: "transparent",
    border: "1px solid #4a4a4a",
    color: "#ffffff",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  return (
    <div style={{ width: "100%", maxWidth: "896px" }}>

      {/* Outer card */}
      <div style={{
        background: "#2d2d2d",
        border: "1px solid #4a4a4a",
        borderRadius: "8px",
        padding: "24px",
      }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", margin: 0 }}>
            Full Quote Generated
          </h2>
          <span style={{
            fontSize: "12px",
            fontWeight: 500,
            background: "rgba(34,197,94,0.1)",
            color: "#22c55e",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "6px",
            padding: "2px 10px",
          }}>
            Accurate Pricing
          </span>
        </div>

        {/* Validity */}
        <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "24px" }}>
          Valid until {formattedDate}
        </p>

        {/* Data grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Coverage Amount</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 500, color: "#ffffff", margin: 0 }}>{fmtAmount(coverageAmount)}</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Monthly Premium</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 500, color: "#1FC3EB", margin: 0 }}>{fmtPremium(monthlyPremium)}</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Deductible</p>
            <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>{fmtAmount(deductible)}</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Employees Covered</p>
            <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>{employeesCovered}</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Avg. Salary</p>
            <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>{fmtAmount(avgSalary)}</p>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "8px" }}>Benefits Included</p>
          <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>{benefitsIncluded}</p>
        </div>

        {/* Success banner */}
        <div style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "8px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
          <p style={{ fontSize: "14px", color: "#16a34a", margin: 0 }}>
            This quote is based on detailed employee data and includes accurate pricing.
          </p>
        </div>
      </div>

      {/* Buttons row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
        <button
          onClick={onBack}
          style={btnOutline}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#4a4a4a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          Back
        </button>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={onCustomize}
            style={btnOutline}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#4a4a4a"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Customize Quote
          </button>
          <button
            onClick={onGenerateDocument}
            style={{
              height: "40px",
              padding: "0 20px",
              fontSize: "1rem",
              fontWeight: 500,
              background: "#1FC3EB",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Generate Document
          </button>
        </div>
      </div>
    </div>
  );
}
