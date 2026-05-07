"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";
import QuickQuoteInputs from "./QuickQuoteInputs";
import AdjustCoverageStep from "./AdjustCoverageStep";
import FullQuoteCapture from "./FullQuoteCapture";
import FullGeneratedQuote from "./FullGeneratedQuote";
import QuoteDocumentPage from "./QuoteDocumentPage";

interface QuoteJourneyPageProps {
  leadReference: string;
  companyName: string;
  initialType?: "quick" | "full";
}

type Step =
  | "SELECT_TYPE"
  | "QUICK_QUOTE"
  | "ADJUST_COVERAGE"
  | "FULL_QUOTE"
  | "FULL_QUOTE_GENERATED"
  | "QUOTE_DOCUMENT";

interface FullQuoteData {
  coverageAmount: number;
  monthlyPremium: number;
  employeesCovered: number;
  avgSalary: number;
  benefitsIncluded: string;
}

interface FormData {
  employees: string;
  genderSplit: string;
  averageAge: string;
  averageIncome: string;
  province: string;
  industry: string;
  cellphone: string;
}

export default function QuoteJourneyPage({
  leadReference,
  companyName,
  initialType,
}: QuoteJourneyPageProps) {
  const getInitialStep = (): Step => {
    if (initialType === "quick") return "QUICK_QUOTE";
    if (initialType === "full") return "FULL_QUOTE";
    return "SELECT_TYPE";
  };

  const router = useRouter();
  const [step, setStep] = useState<Step>(getInitialStep());
  const [fullQuoteData, setFullQuoteData] = useState<FullQuoteData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employees: "",
    genderSplit: "",
    averageAge: "",
    averageIncome: "",
    province: "",
    industry: "",
    cellphone: "",
  });

  if (step === "QUICK_QUOTE") {
    return (
      <>
        <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "24px" }}>
          <h1 style={{ fontSize: "31px", fontWeight: 500, lineHeight: "32px", color: "#ffffff", marginBottom: "24px" }}>Quick Cost Estimate</h1>
        </div>
        <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingBottom: "24px" }}>
          <QuickQuoteInputs
            formData={formData}
            onFormChange={setFormData}
            onBack={() => initialType === "quick" ? router.back() : setStep("SELECT_TYPE")}
            onGenerateQuote={() => setStep("ADJUST_COVERAGE")}
          />
        </div>
      </>
    );
  }

  if (step === "ADJUST_COVERAGE") {
    return (
      <>
        <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "24px" }}>
          <h1 style={{ fontSize: "31px", fontWeight: 500, lineHeight: "32px", color: "#ffffff", marginBottom: "24px" }}>Quick Cost Estimate</h1>
        </div>
        <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingBottom: "24px" }}>
          <AdjustCoverageStep
            onBack={() => setStep("QUICK_QUOTE")}
            onGenerateQuote={() => { /* modal handles download, no navigation */ }}
            onContinueToFull={() => setStep("FULL_QUOTE")}
          />
        </div>
      </>
    );
  }

  if (step === "FULL_QUOTE") {
    return (
      <>
        <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "24px" }}>
          <h1 style={{ fontSize: "31px", fontWeight: 500, lineHeight: "32px", color: "#ffffff", marginBottom: "24px" }}>Full Quote</h1>
        </div>
        <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingBottom: "24px" }}>
          <FullQuoteCapture
            companyName={companyName}
            leadReference={leadReference}
            onBack={() => initialType === "full" ? router.back() : setStep("SELECT_TYPE")}
            onGenerate={(employees) => {
              const count = employees.length;
              setFullQuoteData({
                coverageAmount: 48600000,
                monthlyPremium: 81000,
                employeesCovered: count || 324,
                avgSalary: 25442,
                benefitsIncluded: "Comprehensive medical coverage, Life insurance, Disability coverage, Family assistance",
              });
              setStep("FULL_QUOTE_GENERATED");
            }}
          />
        </div>
      </>
    );
  }

  if (step === "FULL_QUOTE_GENERATED" && fullQuoteData) {
    return (
      <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "24px", paddingBottom: "24px" }}>
        <FullGeneratedQuote
          coverageAmount={fullQuoteData.coverageAmount}
          monthlyPremium={fullQuoteData.monthlyPremium}
          employeesCovered={fullQuoteData.employeesCovered}
          avgSalary={fullQuoteData.avgSalary}
          benefitsIncluded={fullQuoteData.benefitsIncluded}
          onBack={() => setStep("FULL_QUOTE")}
          onCustomize={() => setStep("FULL_QUOTE")}
          onGenerateDocument={() => setStep("QUOTE_DOCUMENT")}
        />
      </div>
    );
  }

  if (step === "QUOTE_DOCUMENT") {
    return (
      <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "24px", paddingBottom: "24px" }}>
        <QuoteDocumentPage
          leadReference={leadReference}
          companyName={companyName}
          onBack={() => setStep("FULL_QUOTE_GENERATED")}
          onEmployerAccepted={() => console.log("Employer accepted quote")}
        />
      </div>
    );
  }

  // SELECT_TYPE - Quote Type Selection UI
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column", paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px" }}>
      {/* Background blur effect */}
      <div
        style={{
          position: "absolute",
          pointerEvents: "none",
          width: "608px",
          height: "608px",
          right: "-200px",
          bottom: "-200px",
          background: "#00C0E8",
          opacity: 0.05,
          filter: "blur(172px)",
          borderRadius: "50%",
        }}
      />

      {/* Quote Type Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexShrink: 0 }}>
        {/* Quick Cost Estimate Card */}
        <button
          onClick={() => setStep("QUICK_QUOTE")}
          style={{
            width: "271px",
            height: "180px",
            background: "rgba(48,48,48,0.8)",
            border: "1px solid #30363D",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "left",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1FC3EB";
            (e.currentTarget as HTMLElement).style.background = "rgba(31,195,235,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#30363D";
            (e.currentTarget as HTMLElement).style.background = "rgba(48,48,48,0.8)";
          }}
        >
          {/* Icon */}
          <div style={{ width: "40px", height: "40px", background: "rgba(230,230,230,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutDashboard size={20} style={{ color: "#E3E3E3" }} />
          </div>

          {/* Title */}
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#E6EDF3", margin: 0 }}>
            Quick Cost Estimate
          </h2>

          {/* Description */}
          <p style={{ fontSize: "0.8125rem", color: "#8B949E", lineHeight: 1.5, margin: 0 }}>
            Simple and Fast! In 30 sec or less
          </p>
        </button>

        {/* Full Quote Card */}
        <button
          onClick={() => setStep("FULL_QUOTE")}
          style={{
            width: "271px",
            height: "180px",
            background: "rgba(48,48,48,0.8)",
            border: "1px solid #30363D",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "left",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1FC3EB";
            (e.currentTarget as HTMLElement).style.background = "rgba(31,195,235,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#30363D";
            (e.currentTarget as HTMLElement).style.background = "rgba(48,48,48,0.8)";
          }}
        >
          {/* Icon */}
          <div style={{ width: "40px", height: "40px", background: "rgba(230,230,230,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={20} style={{ color: "#E3E3E3" }} />
          </div>

          {/* Title */}
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#E6EDF3", margin: 0 }}>
            Full Quote
          </h2>

          {/* Description */}
          <p style={{ fontSize: "0.8125rem", color: "#8B949E", lineHeight: 1.5, margin: 0 }}>
            Complete pricing using real names, the income, birthdate, and salary of each employee.
          </p>
        </button>
      </div>

      {/* Eligibility Criteria Section */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.875rem", color: "#8B949E", lineHeight: 1.6, margin: "0 0 8px 0" }}>
          • 18 to 64 years old
        </p>
        <p style={{ fontSize: "0.875rem", color: "#8B949E", lineHeight: 1.6, margin: "0 0 8px 0" }}>
          • Permanently employed or on 6+ month contract
        </p>
        <p style={{ fontSize: "0.875rem", color: "#8B949E", lineHeight: 1.6, margin: 0 }}>
          • Legally employed & actively working 20+ hours a week in SA
        </p>
      </div>
    </div>
  );
}
