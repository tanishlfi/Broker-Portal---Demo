"use client";

import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import CoverSummary from "@/components/ui/CoverSummary";
import { BackButton, NextButton } from "@/components/ui/StepButtons";

interface FormData {
  employees: string;
  genderSplit: string;
  averageAge: string;
  averageIncome: string;
  province: string;
  industry: string;
  cellphone: string;
}

interface CoverageData {
  lifeCover: number;
  funeralCover: number;
  occupationalDisability: number;
  totalCover: number;
  totalMonthlyPremium: number;
}

interface GeneratedQuoteProps {
  coverageAmount: number;
  monthlyPremium: number;
  numberOfEmployees: number;
  benefitsIncluded: string;
  companyName?: string;
  leadReference?: string;
  formData?: FormData;
  coverageData?: CoverageData;
  validUntilDays?: number;
  onBack: () => void;
  onCustomize: () => void;
  onContinueToFull: () => void;
}

const sectionHeading: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "#1FC3EB",
  marginBottom: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#6b7280",
  marginBottom: "2px",
};

const fieldValue: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#ffffff",
  fontWeight: 500,
};

const divider: React.CSSProperties = {
  borderTop: "1px solid #30363D",
  margin: "0",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={fieldLabel}>{label}</p>
      <p style={fieldValue}>{value}</p>
    </div>
  );
}

export default function GeneratedQuote({
  coverageAmount,
  monthlyPremium,
  numberOfEmployees,
  companyName = "—",
  leadReference = "—",
  formData,
  coverageData,
  validUntilDays = 30,
  onBack,
  onCustomize,
  onContinueToFull,
}: GeneratedQuoteProps) {
  const router = useRouter();
  const fmt = (v: number) =>
    "R " + new Intl.NumberFormat("en-ZA").format(v);

  const handleSaveQuote = () => {
    // TODO: Add API call to save the quote here if needed
    router.push("/dashboard");
  };

  // Use coverageData if available, otherwise use defaults
  const lifeCover = coverageData?.lifeCover || coverageAmount;
  const funeralCover = coverageData?.funeralCover || 10000;
  const occupationalDisability = coverageData?.occupationalDisability || 10000;
  const totalCover = coverageData?.totalCover || (lifeCover + funeralCover + occupationalDisability);
  const totalMonthlyPremium = coverageData?.totalMonthlyPremium || monthlyPremium;

  return (
    <>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "24px" }}>
        Quick Cost Estimate
      </h2>

      <div style={{
        background: "#181818CC",
        border: "0.63px solid #30363D",
        borderRadius: "10px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        flex: 1,
      }}>

        {/* Card header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff" }}>Quote Details</span>
          <button
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: "none",
              color: "#9ca3af", fontSize: "0.8125rem", cursor: "pointer",
              padding: "4px 8px", borderRadius: "6px",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
          >
            <Download size={14} />
            Download
          </button>
        </div>

        <div style={divider} />

        {/* Company Details */}
        <div>
          <p style={sectionHeading}>Company Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <Field label="Company Name" value={companyName} />
            <Field label="Registration Number" value={leadReference} />
            <Field label="Phone Number" value={formData?.cellphone || "+27 828-323-3323"} />
          </div>
        </div>

        <div style={divider} />

        {/* Quote Details */}
        <div>
          <p style={sectionHeading}>Quote Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "12px" }}>
            <Field label="Employees Covered" value={String(numberOfEmployees)} />
            <Field label="Average Age" value={formData?.averageAge || "—"} />
            <Field label="Average Income" value={formData?.averageIncome ? `R ${Number(formData.averageIncome).toLocaleString("en-ZA")}` : "—"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <Field label="Gender Split" value={formData?.genderSplit || "—"} />
            <Field label="Province" value={formData?.province || "—"} />
            <Field label="Industry" value={formData?.industry || "—"} />
          </div>
        </div>

        <div style={divider} />

        {/* Cover Details */}
        <div>
          <p style={sectionHeading}>Cover Details</p>
          <CoverSummary
            lifeCover={lifeCover}
            funeralCover={funeralCover}
            occupationalDisability={occupationalDisability}
            totalCover={totalCover}
            totalMonthlyPremium={totalMonthlyPremium}
          />
        </div>

      </div>

      {/* Action buttons — outside card */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <BackButton onClick={onBack} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleSaveQuote}
            style={{
              height: "33px", padding: "0 20px",
              fontSize: "0.875rem", fontWeight: 500,
              background: "transparent", border: "1px solid #333333",
              color: "#d1d5db", borderRadius: "100px", cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#9ca3af"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#333333"; (e.currentTarget as HTMLElement).style.color = "#d1d5db"; }}
          >
            Save Quick Quote
          </button>
          <NextButton label="Proceed to Full Quote" onClick={onContinueToFull} />
        </div>
      </div>
    </>
  );
}
