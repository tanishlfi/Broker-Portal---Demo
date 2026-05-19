"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
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
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ px: "24px", pt: "24px" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "31px",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "#ffffff",
              mb: "24px",
            }}
          >
            Quick Cost Estimate
          </Typography>
        </Box>
        <Box sx={{ px: "24px", pb: "24px" }}>
          <QuickQuoteInputs
            formData={formData}
            onFormChange={setFormData}
            onBack={() => initialType === "quick" ? router.back() : setStep("SELECT_TYPE")}
            onGenerateQuote={() => setStep("ADJUST_COVERAGE")}
          />
        </Box>
      </Box>
    );
  }

  if (step === "ADJUST_COVERAGE") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ px: "24px", pt: "24px" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "31px",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "#ffffff",
              mb: "24px",
            }}
          >
            Quick Cost Estimate
          </Typography>
        </Box>
        <Box sx={{ px: "24px", pb: "24px" }}>
          {quoteError && (
            <Typography sx={{ color: "#ef4444", fontSize: "0.875rem", mb: "12px" }}>
              {quoteError}
            </Typography>
          )}
          <AdjustCoverageStep
            onBack={() => setStep("QUICK_QUOTE")}
            employeeCount={parseInt(formData.employees, 10) || 0}
            averageAge={parseInt(formData.averageAge, 10) || 35}
            averageIncome={parseFloat(formData.averageIncome) || 0}
            province={formData.province}
            industry={formData.industry}
            companyName={companyName}
            genderMix={formData.genderSplit}
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
              setQuickQuoteData({
                employees: formData.employees,
                genderSplit: formData.genderSplit,
                averageAge: formData.averageAge,
                averageIncome: formData.averageIncome,
                province: formData.province,
                industry: formData.industry,
              });
              
              const params = new URLSearchParams(window.location.search);
              params.set("type", "full");
              window.history.pushState({}, "", `?${params.toString()}`);
              
              setStep("FULL_QUOTE");
            }}
          />
        </Box>
      </Box>
    );
  }

  if (step === "FULL_QUOTE") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ px: "24px", pt: "24px" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "31px",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "#ffffff",
              mb: "24px",
            }}
          >
            Full Quote
          </Typography>
        </Box>
        <Box sx={{ px: "24px", pb: "24px" }}>
          {quoteError && (
            <Typography sx={{ color: "#ef4444", fontSize: "0.875rem", mb: "12px" }}>
              {quoteError}
            </Typography>
          )}
          <FullQuoteCapture
            companyName={companyName}
            leadReference={leadReference}
            quickQuoteData={quickQuoteData}
            quoteReference={generatedQuote?.quoteReference || ""}
            leadId={leadId}
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
        </Box>
      </Box>
    );
  }

  // SELECT_TYPE - Quote Type Selection UI
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        px: "24px",
        py: "16px",
      }}
    >
      {/* Background blur effect */}
      <Box
        sx={{
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
      <Stack direction="row" spacing={2} sx={{ mb: "20px", flexShrink: 0 }}>
        {/* Quick Cost Estimate Card */}
        <Card
          sx={{
            width: "271px",
            height: "180px",
            bgcolor: "rgba(48,48,48,0.8)",
            border: "1px solid #30363D",
            borderRadius: "16px",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#1FC3EB",
              bgcolor: "rgba(31,195,235,0.08)",
            }
          }}
        >
          <CardActionArea
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("type", "quick");
              window.history.pushState({}, "", `?${params.toString()}`);
              setStep("QUICK_QUOTE");
            }}
            sx={{
              height: "100%",
              p: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                width: "40px",
                height: "40px",
                bgcolor: "rgba(230,230,230,0.1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LayoutDashboard size={20} style={{ color: "#E3E3E3" }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", fontWeight: 600, color: "#E6EDF3", m: 0 }}>
              Quick Cost Estimate
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#8B949E", lineHeight: 1.5 }}>
              Simple and Fast! In 30 sec or less
            </Typography>
          </CardActionArea>
        </Card>

        {/* Full Quote Card */}
        <Card
          sx={{
            width: "271px",
            height: "180px",
            bgcolor: "rgba(48,48,48,0.8)",
            border: "1px solid #30363D",
            borderRadius: "16px",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#1FC3EB",
              bgcolor: "rgba(31,195,235,0.08)",
            }
          }}
        >
          <CardActionArea
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("type", "full");
              window.history.pushState({}, "", `?${params.toString()}`);
              setStep("FULL_QUOTE");
            }}
            sx={{
              height: "100%",
              p: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                width: "40px",
                height: "40px",
                bgcolor: "rgba(230,230,230,0.1)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={20} style={{ color: "#E3E3E3" }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", fontWeight: 600, color: "#E6EDF3", m: 0 }}>
              Full Quote
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#8B949E", lineHeight: 1.5 }}>
              Complete pricing using real names, the income, birthdate, and salary of each employee.
            </Typography>
          </CardActionArea>
        </Card>
      </Stack>

      {/* Eligibility Criteria Section */}
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: "0.875rem", color: "#8B949E", lineHeight: 1.6 }}>
          • 18 to 64 years old
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#8B949E", lineHeight: 1.6 }}>
          • Permanently employed or on 6+ month contract
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "#8B949E", lineHeight: 1.6 }}>
          • Legally employed & actively working 20+ hours a week in SA
        </Typography>
      </Stack>
    </Box>
  );
}
