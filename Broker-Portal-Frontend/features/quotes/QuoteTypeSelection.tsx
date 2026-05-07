"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bolt, List } from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";

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
    <main className="relative flex-1 overflow-hidden p-5" style={{ background: "var(--background)" }}>
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

      <section className="relative mx-auto max-w-7xl">
        <div className="px-1 py-4">
          <h1 className="text-[31px] font-medium leading-8 text-white">Quote Generation</h1>
        </div>

        <div className="pt-3">
          <div className="flex flex-wrap gap-4">
            <DashboardCard
              title="Quick Cost Estimate"
              description="Simple and Fast! In 30 sec or less"
              icon={<Bolt size={15} />}
              onClick={handleQuickQuote}
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(180deg, rgba(48,48,48,0.8) 0%, rgba(42,42,42,0.75) 100%)",
                borderColor: "#30363d",
                width: "271px",
                height: "225px",
                minHeight: "225px",
              }}
              iconWrapperClassName="inline-flex h-9 w-9 items-center justify-center rounded-xl"
              iconWrapperStyle={{ background: "rgba(148,163,184,0.14)", color: "#d1d5db", marginBottom: "36px" }}
              titleStyle={{ fontSize: "22px", fontWeight: 500, lineHeight: "24px", color: "#f5f5f5" }}
              descriptionStyle={{ fontSize: "12px", color: "#8f96a3", lineHeight: "18px" }}
            />

            <DashboardCard
              title="Full Quote"
              description="Complete pricing using real names, the income, birthdate, and salary of each employee."
              icon={<List size={15} />}
              onClick={handleFullQuote}
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(180deg, rgba(48,48,48,0.8) 0%, rgba(42,42,42,0.75) 100%)",
                borderColor: "#30363d",
                width: "271px",
                height: "225px",
                minHeight: "225px",
              }}
              iconWrapperClassName="inline-flex h-9 w-9 items-center justify-center rounded-xl"
              iconWrapperStyle={{ background: "rgba(148,163,184,0.14)", color: "#d1d5db", marginBottom: "24px" }}
              titleStyle={{ fontSize: "22px", fontWeight: 500, lineHeight: "24px", color: "#f5f5f5" }}
              descriptionStyle={{ fontSize: "12px", color: "#8f96a3", lineHeight: "18px" }}
            />
          </div>

          <ul className="mt-4 list-disc pl-5 text-xs" style={{ color: "#8f96a3", lineHeight: "20px" }}>
            <li>18 to 64 years old.</li>
            <li>Permanently employed or on 6+ month contract.</li>
            <li>Legally employed & actively working 20+ hours a week in SA.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default function QuoteTypeSelection() {
  return (
    <Suspense fallback={<div className="px-6 pt-6 text-white">Loading...</div>}>
      <QuoteTypeSelectionContent />
    </Suspense>
  );
}
