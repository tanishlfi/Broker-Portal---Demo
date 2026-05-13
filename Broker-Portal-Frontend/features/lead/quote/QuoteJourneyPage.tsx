"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";
import QuickQuoteInputs from "./QuickQuoteInputs";
import AdjustCoverageStep from "./AdjustCoverageStep";
import FullQuoteCapture from "./FullQuoteCapture";
import {
  createQuickQuote,
  createFullQuote,
  normaliseQuote,
  type Quote,
} from "@/lib/api/quotes";

interface QuoteJourneyPageProps {
  leadId: string;
  leadReference: string;
  companyName: string;
  initialType?: "quick" | "full";
}

type Step =
  | "SELECT_TYPE"
  | "QUICK_QUOTE"
  | "ADJUST_COVERAGE"
  | "FULL_QUOTE";


interface FormData {
  employees: string;
  genderSplit: string;
  averageAge: string;
  averageIncome: string;
  province: string;
  industry: string;
  cellphone: string;
}

interface QuickQuotePassData {
  employees: string;
  genderSplit: string;
  averageAge: string;
  averageIncome: string;
  province: string;
  industry: string;
}

export default function QuoteJourneyPage({
  leadId,
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
  const [generatedQuote, setGeneratedQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quickQuoteData, setQuickQuoteData] = useState<QuickQuotePassData | null>(null);
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
          {quoteError && (
            <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "12px" }}>{quoteError}</p>
          )}
          <AdjustCoverageStep
            onBack={() => setStep("QUICK_QUOTE")}
            employeeCount={parseInt(formData.employees, 10) || 0}
            averageAge={parseInt(formData.averageAge, 10) || 35}
            averageIncome={parseFloat(formData.averageIncome) || 0}
            province={formData.province}
            industry={formData.industry}
            quoteReference={generatedQuote?.quoteReference || ""}
            onGenerateQuote={async (coverageData) => {
              setQuoteError(null);
              try {
                const res = await createQuickQuote({
                  lead_id: leadId,
                  workforce_count: parseInt(formData.employees, 10),
                  average_age: parseInt(formData.averageAge, 10),
                  average_salary: parseFloat(formData.averageIncome),
                  province: formData.province,
                  industry: formData.industry,
                  gender_split: formData.genderSplit,
                  benefits: [
                    { benefit_type: "Life Cover", cover_amount: coverageData.lifeCover },
                    { benefit_type: "Funeral Cover", cover_amount: coverageData.funeralCover },
                    { benefit_type: "Occupational Disability", cover_amount: coverageData.occupationalDisability },
                  ],
                });
                setGeneratedQuote(normaliseQuote(res.data));
                // Store quick quote data to pass to full quote
                setQuickQuoteData({
                  employees: formData.employees,
                  genderSplit: formData.genderSplit,
                  averageAge: formData.averageAge,
                  averageIncome: formData.averageIncome,
                  province: formData.province,
                  industry: formData.industry,
                });
              } catch (err: any) {
                setQuoteError(err.message ?? "Failed to generate quote. Please try again.");
              }
            }}
            onContinueToFull={() => {
              // Store quick quote data before moving to full quote
              setQuickQuoteData({
                employees: formData.employees,
                genderSplit: formData.genderSplit,
                averageAge: formData.averageAge,
                averageIncome: formData.averageIncome,
                province: formData.province,
                industry: formData.industry,
              });
              
              // Update URL to reflect Full Quote
              const params = new URLSearchParams(window.location.search);
              params.set("type", "full");
              window.history.pushState({}, "", `?${params.toString()}`);
              
              setStep("FULL_QUOTE");
            }}
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
          {quoteError && (
            <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "12px" }}>{quoteError}</p>
          )}
          <FullQuoteCapture
            companyName={companyName}
            leadReference={leadReference}
            quickQuoteData={quickQuoteData}
            quoteReference={generatedQuote?.quoteReference || ""}
            onBack={() => initialType === "full" ? router.back() : setStep("SELECT_TYPE")}
            onGenerate={async (data) => {
              setQuoteError(null);
              try {
                const res = await createFullQuote({
                  lead_id: leadId,
                  product_id: data.product_id,
                  rma_member_number: data.rma_member_number,
                  is_permanent_employees: data.is_permanent_employees,
                  is_actively_at_work: data.is_actively_at_work,
                  is_replacing_policy: data.is_replacing_policy,
                  replaced_policy_includes_disability: data.replaced_policy_includes_disability,
                  is_policy_older_than_6_months: data.is_policy_older_than_6_months,
                  replaced_policy_start_date: data.replaced_policy_start_date,
                  province: data.province,
                  industry: data.industry,
                  generate_options: data.generate_options,
                  benefits: data.benefits,
                  employees: data.employees,
                  employeeFile: data.employeeFile,
                });
                const quote = normaliseQuote(res.data);
                setGeneratedQuote(quote);
                return quote;
              } catch (err: any) {
                setQuoteError(err.message ?? "Failed to generate quote.");
                throw err;
              }
            }}
          />
        </div>
      </>
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
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set("type", "quick");
            window.history.pushState({}, "", `?${params.toString()}`);
            setStep("QUICK_QUOTE");
          }}
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
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set("type", "full");
            window.history.pushState({}, "", `?${params.toString()}`);
            setStep("FULL_QUOTE");
          }}
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
