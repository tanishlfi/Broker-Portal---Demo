"use client";

import { useState } from "react";
import QuickQuoteInputs from "./QuickQuoteInputs";
import GeneratedQuote from "./GeneratedQuote";
import FullQuoteCapture from "./FullQuoteCapture";

interface QuoteJourneyPageProps {
  leadReference: string;
  companyName: string;
}

type Step = "SELECT_TYPE" | "QUICK_QUOTE" | "QUICK_QUOTE_GENERATED" | "FULL_QUOTE";

interface QuoteData {
  coverageAmount: number;
  monthlyPremium: number;
  numberOfEmployees: number;
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
}: QuoteJourneyPageProps) {
  const [step, setStep] = useState<Step>("SELECT_TYPE");
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employees: "",
    genderSplit: "",
    averageAge: "",
    averageIncome: "",
    province: "",
    industry: "",
    cellphone: "",
  });

  const handleGenerateQuote = (data: QuoteData) => {
    setQuoteData(data);
    setStep("QUICK_QUOTE_GENERATED");
  };

  if (step === "QUICK_QUOTE") {
    return (
      <QuickQuoteInputs 
        formData={formData}
        onFormChange={setFormData}
        onBack={() => setStep("SELECT_TYPE")} 
        onGenerateQuote={handleGenerateQuote}
      />
    );
  }

  if (step === "QUICK_QUOTE_GENERATED" && quoteData) {
    return (
      <GeneratedQuote
        coverageAmount={quoteData.coverageAmount}
        monthlyPremium={quoteData.monthlyPremium}
        numberOfEmployees={quoteData.numberOfEmployees}
        benefitsIncluded={quoteData.benefitsIncluded}
        onBack={() => setStep("QUICK_QUOTE")}
        onCustomize={() => setStep("QUICK_QUOTE")}
        onContinueToFull={() => setStep("FULL_QUOTE")}
      />
    );
  }

  if (step === "FULL_QUOTE") {
    return (
      <FullQuoteCapture
        onBack={() => setStep("SELECT_TYPE")}
        onGenerate={() => {
          // TODO: hook up full quote generation
          console.log("Generate full quote");
        }}
      />
    );
  }

  const quoteCards = [
    {
      key: "QUICK_QUOTE" as Step,
      title: "Quick Quote",
      description: "Generate an indicative quote with estimated pricing based on employee count",
      bullets: ["Fast generation", "Indicative pricing", "No employee data required", "Can upgrade to full quote"],
    },
    {
      key: "FULL_QUOTE" as Step,
      title: "Full Quote",
      description: "Generate a comprehensive quote with detailed employee data and accurate pricing",
      bullets: ["Comprehensive coverage details", "Accurate pricing", "Employee data upload required", "Ready for employer approval"],
    },
  ];

  return (
    <div style={{ width: "100%", maxWidth: "896px" }}>
      <div style={{ background: "#2d2d2d", border: "1px solid #4a4a4a", borderRadius: "8px", padding: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", marginBottom: "16px" }}>
          Select Quote Type
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#a0a0a0", marginBottom: "24px" }}>
          Choose the type of quote you'd like to generate for this lead.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {quoteCards.map(({ key, title, description, bullets }) => (
            <button
              key={key}
              onClick={() => setStep(key)}
              style={{
                textAlign: "left",
                background: "#2d2d2d",
                border: "2px solid #4a4a4a",
                borderRadius: "8px",
                padding: "24px",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#1FC3EB";
                (e.currentTarget.querySelector("h3") as HTMLElement).style.color = "#1FC3EB";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#4a4a4a";
                (e.currentTarget.querySelector("h3") as HTMLElement).style.color = "#ffffff";
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "#ffffff", marginBottom: "8px", transition: "color 0.2s" }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#a0a0a0", marginBottom: "16px" }}>
                {description}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {bullets.map(item => (
                  <li key={item} style={{ fontSize: "0.875rem", color: "#a0a0a0", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#a0a0a0" }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}