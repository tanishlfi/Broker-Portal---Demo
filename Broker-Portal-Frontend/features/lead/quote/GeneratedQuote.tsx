"use client";

import { AlertCircle } from "lucide-react";

interface GeneratedQuoteProps {
  coverageAmount: number;
  monthlyPremium: number;
  numberOfEmployees: number;
  benefitsIncluded: string;
  validUntilDays?: number;
  onBack: () => void;
  onCustomize: () => void;
  onContinueToFull: () => void;
}

export default function GeneratedQuote({
  coverageAmount,
  monthlyPremium,
  numberOfEmployees,
  benefitsIncluded,
  validUntilDays = 30,
  onBack,
  onCustomize,
  onContinueToFull,
}: GeneratedQuoteProps) {
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + validUntilDays);
  const formattedDate = validUntilDate.toLocaleDateString("en-ZA", { year: "numeric", month: "2-digit", day: "2-digit" });

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(v).replace(/\s/g, ",");

  const btnOutline: React.CSSProperties = {
    height: "40px", padding: "0 20px", fontSize: "1rem", fontWeight: 500,
    background: "transparent", border: "1px solid #4a4a4a", color: "#ffffff",
    borderRadius: "6px", cursor: "pointer", transition: "background 0.15s",
  };

  return (
    <div style={{ width: "100%", maxWidth: "896px" }}>
      {/* Card */}
      <div style={{ background: "#2d2d2d", border: "1px solid #4a4a4a", borderRadius: "8px", padding: "24px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", margin: 0 }}>
            Quick Quote Generated
          </h2>
          <span style={{
            fontSize: "12px", fontWeight: 500,
            background: "rgba(59,130,246,0.1)", color: "#3b82f6",
            border: "1px solid rgba(59,130,246,0.2)", borderRadius: "6px",
            padding: "2px 10px",
          }}>
            Indicative Pricing
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
            <p style={{ fontSize: "1.5rem", fontWeight: 500, color: "#ffffff", margin: 0 }}>{fmt(coverageAmount)}</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Estimated Monthly Premium</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 500, color: "#1FC3EB", margin: 0 }}>{fmt(monthlyPremium)}</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Deductible</p>
            <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>R 10,000</p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "4px" }}>Number of Employees</p>
            <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>{numberOfEmployees}</p>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "8px" }}>Benefits Included</p>
          <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>{benefitsIncluded}</p>
        </div>

        {/* Warning banner */}
        <div style={{
          background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)",
          borderRadius: "8px", padding: "16px",
          display: "flex", alignItems: "flex-start", gap: "8px",
        }}>
          <AlertCircle size={16} style={{ color: "#ca8a04", flexShrink: 0, marginTop: "1px" }} />
          <p style={{ fontSize: "14px", color: "#ca8a04", margin: 0 }}>
            This is an indicative quote. For accurate pricing and detailed coverage, please continue to a Full Quote.
          </p>
        </div>
      </div>

      {/* Buttons outside card */}
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
            onClick={onContinueToFull}
            style={{
              height: "40px", padding: "0 20px", fontSize: "1rem", fontWeight: 500,
              background: "#1FC3EB", color: "#ffffff", border: "none",
              borderRadius: "6px", cursor: "pointer", transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Continue to Full Quote
          </button>
        </div>
      </div>
    </div>
  );
}
