"use client";

interface CoverSummaryProps {
  lifeCover: number;
  funeralCover: number;
  occupationalDisability: number;
  totalCover: number;
  totalMonthlyPremium: number;
}

const formatCurrency = (value: number) => `R ${value.toLocaleString("en-ZA")}`;

export default function CoverSummary({
  lifeCover,
  funeralCover,
  occupationalDisability,
  totalCover,
  totalMonthlyPremium,
}: CoverSummaryProps) {
  return (
    <div style={{
      background: "#1E1E1E",
      border: "1px solid #30363D",
      borderRadius: "8px",
      padding: "20px",
    }}>
      <h4 style={{
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#ffffff",
        marginBottom: "16px",
      }}>
        Cover summary
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "#9ca3af" }}>Life</span>
          <span style={{ color: "#ffffff", fontWeight: 500 }}>{formatCurrency(lifeCover)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "#9ca3af" }}>Funeral</span>
          <span style={{ color: "#ffffff", fontWeight: 500 }}>{formatCurrency(funeralCover)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "#9ca3af" }}>Occupational Disability</span>
          <span style={{ color: "#ffffff", fontWeight: 500 }}>{formatCurrency(occupationalDisability)}</span>
        </div>
        <div style={{ borderTop: "1px solid #30363D", marginTop: "4px", paddingTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "12px" }}>
            <span style={{ color: "#9ca3af", fontWeight: 600 }}>Total cover</span>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>{formatCurrency(totalCover)}</span>
          </div>
          <div style={{ borderTop: "1px solid #30363D", paddingTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "#9ca3af", fontWeight: 600 }}>Total monthly premium</span>
              <span style={{ color: "#1FC3EB", fontWeight: 600, fontSize: "1rem" }}>{formatCurrency(totalMonthlyPremium)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
