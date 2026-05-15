"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ChevronDown, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import CancelQuoteModal from "@/components/quotes/CancelQuoteModal";
import { getLeads, type Lead as ApiLead } from "@/lib/api/leads";
import { updateQuoteStatus, formatRand, type Quote as ApiQuote } from "@/lib/api/quotes";

interface Quote {
  id: string;
  companyName: string;
  quoteType: "Quick Quote" | "Full Quote";
  daysRemaining: number;
  quoteId: string;
  quoteReference: string;
  monthlyPremium: string;
  coverageAmount: string;
  createdDate: string;
  status: "new" | "onboarding" | "approved" | "pending" | "cancelled";
}

interface Lead {
  id: string;
  companyName: string;
  employees: number;
  status: string;
  leadId: string;
  leadReference: string;
}

const mockQuotesData: Quote[] = [];

export default function QuotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotesData);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "onboarding" | "approved" | "pending" | "cancelled">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [openActionsMenu, setOpenActionsMenu] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedQuoteForApproval, setSelectedQuoteForApproval] = useState<Quote | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedQuoteForCancel, setSelectedQuoteForCancel] = useState<Quote | null>(null);

  // Check for tab query parameter on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["new", "onboarding", "approved", "pending", "cancelled"].includes(tab)) {
      setActiveTab(tab as "new" | "onboarding" | "approved" | "pending" | "cancelled");
    }
  }, [searchParams]);

  // Load leads (for the "Add New Quote" modal) and derive quotes from lead quote data
  useEffect(() => {
    async function load() {
      setLeadsLoading(true);
      try {
        const apiLeads = await getLeads();
        // Build leads list for the modal
        setLeads(
          apiLeads.map((l) => ({
            id: l.leadId,
            companyName: l.employerName,
            employees: l.numberOfEmployees,
            status: l.status,
            leadId: l.leadId,
            leadReference: l.leadReference,
          }))
        );
        // Derive quotes from leads that have a quoteStatus
        const derivedQuotes: Quote[] = apiLeads
          .filter((l) => l.quoteStatus)
          .map((l) => ({
            id: l.leadId,
            companyName: l.employerName,
            quoteType: "Quick Quote" as const,
            daysRemaining: 30,
            quoteId: l.leadReference,
            quoteReference: l.leadReference,
            monthlyPremium: "—",
            coverageAmount: "—",
            createdDate: l.createdAt
              ? new Date(l.createdAt).toLocaleDateString("en-ZA")
              : "—",
            status: (l.quoteStatus as Quote["status"]) ?? "new",
          }));
        if (derivedQuotes.length > 0) setQuotes(derivedQuotes);
      } catch {
        // keep existing state on error
      } finally {
        setLeadsLoading(false);
      }
    }
    load();
  }, []);

  // Filter quotes by active tab
  const filteredQuotes = quotes.filter((quote) => quote.status === activeTab);

  // Update tab counts dynamically
  const tabs = [
    { key: "new" as const, label: `New Quotes (${quotes.filter(q => q.status === "new").length})`, count: quotes.filter(q => q.status === "new").length },
    { key: "onboarding" as const, label: `In Onboarding (${quotes.filter(q => q.status === "onboarding").length})`, count: quotes.filter(q => q.status === "onboarding").length },
    { key: "cancelled" as const, label: `Cancelled (${quotes.filter(q => q.status === "cancelled").length})`, count: quotes.filter(q => q.status === "cancelled").length },
    { key: "approved" as const, label: `Expired Quoted`, count: 0 },
  ];

  const handleProceedWithQuote = () => {
    if (selectedLead) {
      router.push(
        `/quotes/new?leadId=${selectedLead.leadId}&ref=${selectedLead.leadReference}&company=${encodeURIComponent(selectedLead.companyName)}`
      );
    }
  };

  const handleMarkAsApproved = (quote: Quote) => {
    setSelectedQuoteForApproval(quote);
    setShowApproveModal(true);
    setOpenActionsMenu(null);
  };

  const handleCancelQuote = (quote: Quote) => {
    setSelectedQuoteForCancel(quote);
    setShowCancelModal(true);
    setOpenActionsMenu(null);
  };

  const handleConfirmCancel = async () => {
    if (selectedQuoteForCancel) {
      // Optimistic update
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === selectedQuoteForCancel.id ? { ...q, status: "cancelled" as const } : q
        )
      );
      try {
        await updateQuoteStatus(selectedQuoteForCancel.quoteId, "cancelled");
      } catch {
        // revert on failure
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === selectedQuoteForCancel.id
              ? { ...q, status: selectedQuoteForCancel.status }
              : q
          )
        );
      }
    }
    setShowCancelModal(false);
    setSelectedQuoteForCancel(null);
    setActiveTab("cancelled");
  };

  const handleSendOTP = async () => {
    if (selectedQuoteForApproval) {
      // Optimistic update
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === selectedQuoteForApproval.id ? { ...q, status: "approved" as const } : q
        )
      );
      try {
        await updateQuoteStatus(selectedQuoteForApproval.quoteId, "approved");
      } catch {
        // revert on failure
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === selectedQuoteForApproval.id
              ? { ...q, status: selectedQuoteForApproval.status }
              : q
          )
        );
      }
    }
    setShowApproveModal(false);
    setSelectedQuoteForApproval(null);
    setActiveTab("approved");
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
      <div className="flex items-center justify-between mb-6 px-6 pt-6">
        <h1 className="text-lg font-medium text-white">Quotes</h1>
        <button
          suppressHydrationWarning
          onClick={() => setShowLeadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1FC3EB] text-[#0A0A0A] rounded-lg font-bold text-sm hover:bg-[#1AB3D9] transition-colors"
        >
          <Plus size={20} />
          Add New Quote
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-4">
        {/* Search Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Search Quotes</label>
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
            />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Search by company name or quote ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-[#2D2D2D] border-2 border-[#4A4A4A] rounded-lg text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#1FC3EB] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              suppressHydrationWarning
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 h-8 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#1FC3EB] text-[#151515]"
                  : "bg-[rgba(58,58,58,0.3)] text-white border border-[#3A3A3A] hover:bg-[rgba(58,58,58,0.5)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quotes List */}
        <div className="space-y-4">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#A0A0A0] text-sm">No quotes in this category</p>
            </div>
          ) : (
            filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="relative bg-[#1E1E1E] border border-[#4A4A4A] rounded-[10px] p-6"
              >
                <div className="flex justify-between items-start">
                  {/* Left Section */}
                  <div className="space-y-4 flex-1">
                    {/* Company Name & Badges */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-white">{quote.companyName}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-lg border ${
                          quote.quoteType === "Quick Quote"
                            ? "bg-[rgba(43,127,255,0.1)] border-[rgba(43,127,255,0.2)] text-[#2B7FFF]"
                            : "bg-[rgba(31,195,235,0.1)] border-[rgba(31,195,235,0.2)] text-[#1FC3EB]"
                        }`}
                      >
                        {quote.quoteType}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-lg border border-[#4A4A4A] text-white">
                        {quote.daysRemaining} days remaining
                      </span>
                    </div>

                    {/* Quote Details Grid */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-[#A0A0A0]">Quote ID</p>
                        <p className="text-sm font-medium text-white">{quote.quoteId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-[#A0A0A0]">Monthly Premium</p>
                        <p className="text-sm font-medium text-[#1FC3EB]">{quote.monthlyPremium}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-[#A0A0A0]">Coverage Amount</p>
                        <p className="text-sm font-medium text-white">{quote.coverageAmount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-[#A0A0A0]">Created Date</p>
                        <p className="text-sm font-medium text-white">{quote.createdDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="relative">
                    <button
                      suppressHydrationWarning
                      onClick={() =>
                        setOpenActionsMenu(openActionsMenu === quote.id ? null : quote.id)
                      }
                      className="flex items-center gap-1 px-4 h-9 bg-[rgba(58,58,58,0.3)] border border-[#3A3A3A] rounded-lg text-sm font-medium text-white hover:bg-[rgba(58,58,58,0.5)] transition-colors"
                    >
                      Actions
                      <ChevronDown size={20} />
                    </button>

                    {/* Actions Dropdown */}
                    {openActionsMenu === quote.id && (
                      <div className="absolute right-0 top-12 w-52 bg-[#262626] border border-[#3A3A3A] rounded-lg shadow-lg z-10">
                        <div className="p-4 space-y-5">
                          <button
                            onClick={() => {
                              // Pass quote data through URL params
                              const params = new URLSearchParams({
                                companyName: quote.companyName,
                                quoteType: quote.quoteType,
                                quoteId: quote.quoteId,
                                monthlyPremium: quote.monthlyPremium,
                                coverageAmount: quote.coverageAmount,
                                createdDate: quote.createdDate,
                              });
                              router.push(`/quotes/${quote.id}?${params.toString()}`);
                              setOpenActionsMenu(null);
                            }}
                            className="w-full text-left text-sm font-medium text-white hover:text-[#1FC3EB] transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleMarkAsApproved(quote)}
                            className="w-full text-left text-sm font-medium text-white hover:text-[#1FC3EB] transition-colors"
                          >
                            Mark as Approved
                          </button>
                          <button
                            onClick={() => handleCancelQuote(quote)}
                            className="w-full text-left text-sm font-medium text-white hover:text-[#1FC3EB] transition-colors"
                          >
                            Cancel Quote
                          </button>
                          <button className="w-full text-left text-sm font-medium text-white hover:text-[#1FC3EB] transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lead Selection Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,11,11,0.72)] backdrop-blur-[10.5px] p-4">
          <div className="w-full max-w-[672px] max-h-[90vh] bg-[#1E1E1E] border border-[#4A4A4A] rounded-[10px] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#4A4A4A] flex-shrink-0">
              <h2 className="text-xl font-medium text-white">Generate New Quote</h2>
              <button
                onClick={() => {
                  setShowLeadModal(false);
                  setSelectedLead(null);
                }}
                className="text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-3">
                {leadsLoading ? (
                  <p className="text-sm text-[#A0A0A0] text-center py-4">Loading leads...</p>
                ) : leads.length === 0 ? (
                  <p className="text-sm text-[#A0A0A0] text-center py-4">No leads available</p>
                ) : (
                  leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`w-full p-4 rounded-[10px] text-left transition-all ${
                        selectedLead?.id === lead.id
                          ? "bg-[rgba(58,58,58,0.5)] border-2 border-[#1FC3EB]"
                          : "bg-[rgba(58,58,58,0.5)] border border-[#4A4A4A] hover:border-[#1FC3EB]"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-base font-medium text-white">{lead.companyName}</p>
                        <p className="text-sm text-[#A0A0A0]">
                          Employees: {lead.employees} • Status: {lead.status}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-6 border-t border-[#4A4A4A] flex-shrink-0">
              <button
                onClick={handleProceedWithQuote}
                disabled={!selectedLead}
                className={`px-6 h-9 rounded-lg font-bold text-sm transition-all ${
                  selectedLead
                    ? "bg-[#1FC3EB] text-[#0A0A0A] hover:bg-[#1AB3D9]"
                    : "bg-[#3A3A3A] text-[#6B6B6B] cursor-not-allowed"
                }`}
              >
                Proceed With Quote Generation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Quote Modal */}
      {showApproveModal && selectedQuoteForApproval && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedQuoteForApproval(null);
          }}
          quoteId={selectedQuoteForApproval.quoteId}
          companyName={selectedQuoteForApproval.companyName}
          onSendOTP={handleSendOTP}
        />
      )}

      {/* Cancel Quote Modal */}
      {showCancelModal && selectedQuoteForCancel && (
        <CancelQuoteModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedQuoteForCancel(null);
          }}
          quoteId={selectedQuoteForCancel.quoteId}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}
