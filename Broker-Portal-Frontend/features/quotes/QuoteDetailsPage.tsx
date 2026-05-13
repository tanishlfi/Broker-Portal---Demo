"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Download, X } from "lucide-react";
import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import { getQuote, updateQuoteStatus, formatRand, normaliseQuote, type Quote as ApiQuote } from "@/lib/api/quotes";

export default function QuoteDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [convertedToFull, setConvertedToFull] = useState(false);
  const [apiQuote, setApiQuote] = useState<ApiQuote | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback values from URL params (used while loading or if fetch fails)
  const companyNameParam = searchParams.get("companyName") || "Unknown Company";
  const quoteTypeParam = searchParams.get("quoteType") || "Quick Quote";
  const quoteIdParam = searchParams.get("quoteId") || "N/A";
  const monthlyPremiumParam = searchParams.get("monthlyPremium") || "R 0";
  const coverageAmountParam = searchParams.get("coverageAmount") || "R 0";
  const createdDateParam = searchParams.get("createdDate") || "N/A";

  // The route param is the quoteId; we use it as the quoteReference for the GET call
  const quoteReference = (params.quoteId as string) || quoteIdParam;

  useEffect(() => {
    async function fetchQuote() {
      if (!quoteReference || quoteReference === "N/A") {
        setLoading(false);
        return;
      }
      try {
        const res = await getQuote(quoteReference);
        setApiQuote(normaliseQuote(res.data));
      } catch {
        // fall back to URL params
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [quoteReference]);

  // Resolved display values — prefer API data, fall back to URL params
  const companyName    = apiQuote?.companyName    ?? companyNameParam;
  const quoteType      = apiQuote?.quoteType      ?? (quoteTypeParam as "Quick Quote" | "Full Quote");
  const quoteId        = apiQuote?.quoteReference ?? quoteIdParam;
  const monthlyPremium = apiQuote ? formatRand(apiQuote.monthlyPremium) : monthlyPremiumParam;
  const coverageAmount = apiQuote ? formatRand(apiQuote.coverageAmount) : coverageAmountParam;
  const createdDate    = apiQuote?.createdAt
    ? new Date(apiQuote.createdAt).toLocaleDateString("en-ZA")
    : createdDateParam;

  const isFullQuote = quoteType === "Full Quote" || convertedToFull;

  const quoteData = {
    companyName,
    quoteType,
    quoteId,
    monthlyPremium,
    coverageAmount,
    createdDate,
    registrationNumber: apiQuote?.registrationNumber ?? "—",
    employeesCovered:   String(apiQuote?.numberOfEmployees ?? "—"),
    averageAge:         apiQuote?.averageAge ? String(apiQuote.averageAge) : "—",
    averageIncome:      apiQuote?.averageMonthlyIncome ? formatRand(apiQuote.averageMonthlyIncome) : "—",
    genderSplit:        apiQuote?.genderSplit ?? "—",
    province:           apiQuote?.province   ?? "—",
    industry:           apiQuote?.industry   ?? "—",
    scheme:             apiQuote?.scheme     ?? "Group Life",
    benefits:           apiQuote?.benefits   ?? ["Group Life Cover", "Accidental Cover (GPA)", "Funeral Cover"],
    valueAddedServices: apiQuote?.valueAddedServices ?? ["Repatriation", "Funeral Assistance", "Groceries Benefit", "Airtime Benefit"],
    deductible:         apiQuote?.deductible ? formatRand(apiQuote.deductible) : "R 40,000",
    // Contact details for the approve modal
    contactFirstName:   apiQuote?.contactFirstName ?? "—",
    contactLastName:    apiQuote?.contactLastName  ?? "",
    contactEmail:       apiQuote?.contactEmail     ?? "—",
    contactMobile:      apiQuote?.contactMobile    ?? "—",
  };

  const handleApproveSuccess = async () => {
    try {
      await updateQuoteStatus(quoteId, "approved");
    } catch {
      // best-effort
    }
    setShowApproveModal(false);
    router.push("/quotes?tab=approved");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(11, 11, 11, 0.72)",
        backdropFilter: "blur(10.5px)",
      }}
      onClick={() => router.back()}
    >
      {/* Modal Container */}
      <div
        className="relative flex flex-col gap-6 overflow-y-auto"
        style={{
          width: "896px",
          maxHeight: "90vh",
          background: "#1E1E1E",
          border: "0.625px solid #4A4A4A",
          borderRadius: "10px",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p style={{ color: "#A0A0A0", fontSize: "14px" }}>Loading quote details...</p>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "30px",
                letterSpacing: "-0.449219px",
                color: "#FFFFFF",
              }}
            >
              Quote Details
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-lg border ${
                quoteType === "Quick Quote"
                  ? "bg-[rgba(43,127,255,0.1)] border-[rgba(43,127,255,0.2)] text-[#2B7FFF]"
                  : "bg-[rgba(31,195,235,0.1)] border-[rgba(31,195,235,0.2)] text-[#1FC3EB]"
              }`}
            >
              {quoteType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: "rgba(58, 58, 58, 0.3)",
                border: "0.625px solid #3A3A3A",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "rgba(58, 58, 58, 0.3)",
                border: "0.625px solid #3A3A3A",
                color: "#FFFFFF",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Company Details */}
        <div className="flex flex-col gap-4">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#1FC3EB",
            }}
          >
            Company Details
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Company Name</p>
              <p style={{ fontSize: "14px", color: "#FFFFFF" }}>{quoteData.companyName}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Registration Number</p>
              <p style={{ fontSize: "14px", color: "#FFFFFF" }}>{quoteData.registrationNumber}</p>
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="flex flex-col gap-4">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#1FC3EB",
            }}
          >
            Quote Details
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Employees Covered</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                {quoteData.employeesCovered}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Average Age</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                {quoteData.averageAge}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Average Income</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                {quoteData.averageIncome}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Gender Split</p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textTransform: "capitalize",
                }}
              >
                {quoteData.genderSplit}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Province</p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textTransform: "capitalize",
                }}
              >
                {quoteData.province}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Industry</p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textTransform: "capitalize",
                }}
              >
                {quoteData.industry}
              </p>
            </div>
          </div>
        </div>

        {/* Scheme Details */}
        <div className="flex flex-col gap-4">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#1FC3EB",
            }}
          >
            Scheme Details
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Scheme</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                {quoteData.scheme}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Benefits</p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#FFFFFF",
                  lineHeight: "17px",
                  letterSpacing: "-0.3125px",
                }}
              >
                {quoteData.benefits.join(" ")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Value Added Services</p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#FFFFFF",
                  lineHeight: "17px",
                  letterSpacing: "-0.3125px",
                }}
              >
                {quoteData.valueAddedServices.join(" ")}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Details */}
        <div className="flex flex-col gap-4">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#1FC3EB",
            }}
          >
            Premium Details
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Estimated Monthly Premium</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#1FC3EB" }}>
                {quoteData.monthlyPremium}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Total Coverage Amount</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                {quoteData.coverageAmount}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Deductible</p>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>
                {quoteData.deductible}
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Details - Only for Full Quote or after conversion */}
        {isFullQuote && (
          <div className="flex flex-col gap-4">
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 500,
                lineHeight: "27px",
                letterSpacing: "-0.439453px",
                color: "#FFFFFF",
              }}
            >
              Coverage Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Life Cover Card */}
              <div
                className="flex flex-col gap-1 p-4 rounded-[10px]"
                style={{
                  background: "rgba(58, 58, 58, 0.5)",
                }}
              >
                <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Life Cover</p>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    lineHeight: "28px",
                    letterSpacing: "-0.449219px",
                    color: "#FFFFFF",
                  }}
                >
                  R 0.5x monthly salary
                </p>
                <p style={{ fontSize: "12px", color: "#A0A0A0" }}>
                  Avg of R 6,000.00 per employee
                </p>
              </div>

              {/* Funeral Cover Card */}
              <div
                className="flex flex-col gap-1 p-4 rounded-[10px]"
                style={{
                  background: "rgba(58, 58, 58, 0.5)",
                }}
              >
                <p style={{ fontSize: "14px", color: "#A0A0A0" }}>Funeral Cover</p>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    lineHeight: "28px",
                    letterSpacing: "-0.449219px",
                    color: "#FFFFFF",
                  }}
                >
                  R 20,000
                </p>
                <p style={{ fontSize: "12px", color: "#A0A0A0" }}>per employee</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-6 pt-4">
          <button
            className="px-4 py-2 rounded-lg"
            style={{
              background: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              color: "#0A0A0A",
            }}
          >
            Download Quote
          </button>

          {quoteType === "Quick Quote" && !convertedToFull ? (
            /* Quick Quote: show Convert to Full Quote button */
            <button
              onClick={() => setConvertedToFull(true)}
              className="px-4 py-2 rounded-lg"
              style={{
                background: "#1FC3EB",
                fontSize: "14px",
                fontWeight: 700,
                color: "#0A0A0A",
              }}
            >
              Convert to Full Quote
            </button>
          ) : (
            /* Full Quote or converted: show Approve Quote button */
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 rounded-lg"
              style={{
                background: "#1FC3EB",
                fontSize: "14px",
                fontWeight: 700,
                color: "#0A0A0A",
              }}
            >
              Approve Quote
            </button>
          )}
        </div>
        </>
        )}
      </div>

      {/* Approve Quote Modal */}
      {showApproveModal && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          quoteId={quoteId}
          companyName={companyName}
          contactFirstName={quoteData.contactFirstName}
          contactLastName={quoteData.contactLastName}
          contactEmail={quoteData.contactEmail}
          contactMobile={quoteData.contactMobile}
          onSendOTP={handleApproveSuccess}
        />
      )}
    </div>
  );
}
