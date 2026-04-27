"use client";

import { ArrowLeft, AlertCircle } from "lucide-react";

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

  const formattedDate = validUntilDate.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value).replace(/\s/g, ",");
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value).replace(/\s/g, ",");
  };

  return (
    <div className="w-full max-w-[700px] flex flex-col gap-4 pb-10">
      
      {/* MAIN CARD */}
      <div className="bg-[#2b2b2b] border border-[#3a3a3a] rounded-lg px-8 py-6 w-full">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-white text-sm font-semibold">
              Quick Quote Generated
            </h2>
            <p className="text-gray-400 text-[11px]">
              Valid until {formattedDate}
            </p>
          </div>

          <span className="text-[10px] bg-[#2d3e50] text-[#7fb3ff] px-2 py-1 rounded">
            INDICATIVE PRICING
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-2 gap-y-6 mb-6">

          {/* Coverage */}
          <div>
            <p className="text-gray-400 text-[11px] mb-1">
              Coverage Amount
            </p>
            <p className="text-white text-lg font-semibold">
              {formatCurrency(coverageAmount)}
            </p>
          </div>

          {/* Premium */}
          <div>
            <p className="text-gray-400 text-[11px] mb-1">
              Estimated Monthly Premium
            </p>
            <p className="text-[#29abe2] text-lg font-semibold">
              {formatCurrencyCompact(monthlyPremium)}
            </p>
          </div>

          {/* Deductible (static like screenshot) */}
          <div>
            <p className="text-gray-400 text-[11px] mb-1">Deductible</p>
            <p className="text-white text-sm font-medium">R 10,000</p>
          </div>

          {/* Employees */}
          <div>
            <p className="text-gray-400 text-[11px] mb-1">
              Number of Employees
            </p>
            <p className="text-white text-sm font-medium">
              {numberOfEmployees}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-5">
          <p className="text-gray-400 text-[11px] mb-1">
            Benefits Included
          </p>
          <p className="text-white text-sm">
            {benefitsIncluded}
          </p>
        </div>

        {/* Warning */}
        <div className="bg-[#3a3724] border border-[#5a5530] rounded px-3 py-2 flex items-center gap-2 text-[11px] text-[#d4af37]">
          <AlertCircle size={14} />
          <span>
            This is an indicative quote. For accurate pricing and detailed coverage,
            please continue to a Full Quote.
          </span>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-[#2f2f2f] hover:bg-[#3a3a3a] border border-[#444] text-white text-xs px-4 py-2 rounded"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={onCustomize}
            className="bg-[#2f2f2f] hover:bg-[#3a3a3a] border border-[#444] text-white text-xs px-4 py-2 rounded"
          >
            Customize Quote
          </button>

          <button
            onClick={onContinueToFull}
            className="bg-[#2da8df] hover:bg-[#2498cc] text-white text-xs px-4 py-2 rounded"
          >
            Continue to Full Quote
          </button>
        </div>
      </div>
    </div>
  );
}