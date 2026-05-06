"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";

function QuoteTypeSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const leadId = searchParams.get("leadId") || "";
  const companyName = searchParams.get("company") || "";
  const ref = searchParams.get("ref") || "";

  const handleQuickQuote = () => {
    // Navigate to quick quote page
    router.push(`/lead/${leadId}/quote?ref=${ref}&company=${encodeURIComponent(companyName)}&type=quick`);
  };

  const handleFullQuote = () => {
    // Navigate to full quote page
    router.push(`/lead/${leadId}/quote?ref=${ref}&company=${encodeURIComponent(companyName)}&type=full`);
  };

  return (
    <div className="relative w-full h-full">
      {/* Background blur effect */}
      <div
        className="absolute pointer-events-none"
        style={{
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

      {/* Header */}
      <div className="px-6 pt-6 mb-8">
        <h1 className="text-lg font-medium text-white">Quote Generation</h1>
      </div>

      {/* Quote Type Cards */}
      <div className="px-6">
        <div className="flex gap-4">
          {/* Quick Cost Estimate Card */}
          <button
            onClick={handleQuickQuote}
            className="w-[271px] h-[225px] bg-[rgba(48,48,48,0.8)] border border-[#30363D] rounded-2xl p-6 text-left hover:border-[#1FC3EB] transition-all group"
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-[rgba(230,230,230,0.1)] rounded-2xl flex items-center justify-center mb-12">
              <LayoutDashboard size={24} className="text-[#E3E3E3]" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-[#E6EDF3] mb-4 group-hover:text-[#1FC3EB] transition-colors">
              Quick Cost Estimate
            </h2>

            {/* Description */}
            <p className="text-sm text-[#8B949E] leading-5">
              Simple and Fast! In 30 sec or less
            </p>
          </button>

          {/* Full Quote Card */}
          <button
            onClick={handleFullQuote}
            className="w-[271px] h-[225px] bg-[rgba(48,48,48,0.8)] border border-[#30363D] rounded-2xl p-6 text-left hover:border-[#1FC3EB] transition-all group"
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-[rgba(230,230,230,0.1)] rounded-2xl flex items-center justify-center mb-6">
              <FileText size={24} className="text-[#E3E3E3]" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-[#E6EDF3] mb-4 group-hover:text-[#1FC3EB] transition-colors">
              Full Quote
            </h2>

            {/* Description */}
            <p className="text-sm text-[#8B949E] leading-5">
              Complete pricing using real names, the income, birthdate, and salary of each employee.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuoteTypeSelection() {
  return (
    <Suspense fallback={<div className="px-6 pt-6 text-white">Loading...</div>}>
      <QuoteTypeSelectionContent />
    </Suspense>
  );
}
