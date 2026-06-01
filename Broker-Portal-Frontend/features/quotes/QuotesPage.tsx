"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronDown, X } from "lucide-react";

import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  Chip,
  Grid,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";

import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import CancelQuoteModal from "@/components/quotes/CancelQuoteModal";
import QuoteDetailsPage from "./QuoteDetailsPage";
import { getLeads } from "@/lib/api/leads";
import { getQuotes, updateQuoteStatus, formatRand, type Quote as ApiQuote } from "@/lib/api/quotes";
import { getRepresentativeId } from "@/lib/auth";
import { QuoteStatus } from "@/lib/enums";
import FilterToolbar from "@/components/ui/FilterToolbar";
import QuoteCard from "@/components/ui/QuoteCard";

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
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactMobile?: string;
}

interface Lead {
  id: string;
  companyName: string;
  employees: number;
  status: string;
  leadId: string;
  leadReference: string;
}

const TABS = [
  { key: "new" as const, label: "New" },
  { key: "onboarding" as const, label: "Onboarding" },
  { key: "approved" as const, label: "Approved" },
  { key: "pending" as const, label: "Pending" },
  { key: "cancelled" as const, label: "Cancelled" },
];

export default function QuotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "onboarding" | "approved" | "pending" | "cancelled">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedQuoteForApproval, setSelectedQuoteForApproval] = useState<Quote | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedQuoteForCancel, setSelectedQuoteForCancel] = useState<Quote | null>(null);
  const [activeMenuQuote, setActiveMenuQuote] = useState<Quote | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [detailsQuoteId, setDetailsQuoteId] = useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, quote: Quote) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuQuote(quote);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenuQuote(null);
  };

  // Check for tab query parameter on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["new", "onboarding", "approved", "pending", "cancelled"].includes(tab)) {
      setActiveTab(tab as "new" | "onboarding" | "approved" | "pending" | "cancelled");
    }
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearchQuery, activeTab, sortBy, sortOrder]);

  // Fetch leads for the "New Quote" modal only when opened
  useEffect(() => {
    if (showLeadModal && leads.length === 0) {
      setLeadsLoading(true);
      getLeads().then(apiLeads => {
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
      }).catch(err => {
        console.error("Failed to load leads for modal:", err);
      }).finally(() => {
        setLeadsLoading(false);
      });
    }
  }, [showLeadModal, leads.length]);

  // Load actual quotes from the quotes API
  const load = useCallback(async () => {
    try {
      const representativeId = getRepresentativeId() ?? undefined;

      const getStatusesForTab = (tab: string) => {
        switch (tab) {
          case "new": return [QuoteStatus.DRAFT, QuoteStatus.GENERATED, QuoteStatus.REVISED];
          case "pending": return [QuoteStatus.AWAITING_EMPLOYER_ACCEPTANCE, "Awaiting OTP"];
          case "onboarding": return [QuoteStatus.ACCEPTED];
          case "approved": return [QuoteStatus.EXPIRED];
          case "cancelled": return [QuoteStatus.REJECTED, "Cancelled"];
          default: return undefined;
        }
      };

      const filters: any = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
        quote_status: getStatusesForTab(activeTab),
      };
      if (debouncedSearchQuery) {
        if (debouncedSearchQuery.toLowerCase().startsWith("qt-")) {
          filters.quote_reference = debouncedSearchQuery;
        } else {
          filters.clientName = debouncedSearchQuery;
        }
      }

      const apiQuotes = await getQuotes(representativeId, filters);

      // Map backend quotes to frontend Quote interface
      const derivedQuotes: Quote[] = apiQuotes.map((q) => {
        // Status mapping: backend -> frontend tabs
        let tabStatus: Quote["status"] = "new";
        const backendStatus = q.status;

        if ([QuoteStatus.DRAFT, QuoteStatus.GENERATED, QuoteStatus.REVISED].includes(backendStatus as QuoteStatus)) {
          tabStatus = "new";
        } else if ([QuoteStatus.AWAITING_EMPLOYER_ACCEPTANCE, "Awaiting OTP"].includes(backendStatus)) {
          tabStatus = "pending";
        } else if (backendStatus === QuoteStatus.ACCEPTED) {
          tabStatus = "onboarding";
        } else if (backendStatus === QuoteStatus.EXPIRED) {
          tabStatus = "approved";
        } else if ([QuoteStatus.REJECTED, "Cancelled"].includes(backendStatus)) {
          tabStatus = "cancelled";
        }

        // Calculate days remaining (using validUntilDays from API or defaulting to 30)
        const createdDate = new Date(q.createdAt);
        const expiryDate = new Date(createdDate.getTime() + (q.validUntilDays || 30) * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

        return {
          id: q.quoteId, // Actual quote UUID
          companyName: q.companyName,
          quoteType: q.quoteType as any,
          daysRemaining,
          quoteId: q.quoteReference, // Human readable reference
          quoteReference: q.quoteReference,
          monthlyPremium: formatRand(q.monthlyPremium),
          coverageAmount: formatRand(q.coverageAmount),
          createdDate: createdDate.toLocaleDateString("en-ZA"),
          status: tabStatus,
          contactFirstName: q.contactFirstName,
          contactLastName: q.contactLastName,
          contactEmail: q.contactEmail,
          contactMobile: q.contactMobile,
        };
      });

      setQuotes(derivedQuotes);
      if (apiQuotes.pagination) {
        setTotalPages(Math.max(1, Math.ceil(apiQuotes.pagination.total / 10)));
      }
    } catch (err) {
      console.error("Failed to load quotes:", err);
    }
  }, [debouncedSearchQuery, page, sortBy, sortOrder, activeTab]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    load();
    intervalId = setInterval(() => load(), 10000);

    return () => clearInterval(intervalId);
  }, [load]);

  const handleProceedWithQuote = () => {
    if (selectedLead) {
      router.push(
        `/quotes/new?leadId=${selectedLead.leadId}&ref=${selectedLead.leadReference}&company=${encodeURIComponent(selectedLead.companyName)}`
      );
    }
  };

  const handleMarkAsApproved = (quote: Quote) => {
    router.push(`/quotes/${quote.id}/checkout?companyName=${encodeURIComponent(quote.companyName)}&ref=${encodeURIComponent(quote.quoteReference)}`);
  };

  const handleCancelQuote = (quote: Quote) => {
    setSelectedQuoteForCancel(quote);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedQuoteForCancel) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === selectedQuoteForCancel.id ? { ...q, status: "cancelled" as const } : q
        )
      );
      try {
        await updateQuoteStatus(selectedQuoteForCancel.quoteId, "cancelled");
      } catch {
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

  const handleSendOTP = () => {
    setShowApproveModal(false);
    setSelectedQuoteForApproval(null);
    setActiveTab("onboarding");
    load(); // Trigger immediate non-blocking refresh of quotes list!
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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

      {/* Scrollable Content Container */}
      <Box sx={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px", px: "24px", pt: "24px" }}>
          <Typography variant="h1" sx={{ fontSize: "20px", fontWeight: 500, color: "var(--text-primary)" }}>
            Quotes
          </Typography>
          <Button
            onClick={() => setShowLeadModal(true)}
            variant="contained"
            startIcon={<Plus size={20} />}
            sx={{
              bgcolor: "#1FC3EB",
              color: "#0A0A0A",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "none",
              height: "40px",
              px: "16px",
              "&:hover": {
                bgcolor: "#1AB3D9",
              },
              "& .MuiButton-startIcon": {
                color: "#0A0A0A",
              }
            }}
          >
            Add New Quote
          </Button>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Search & Sort row */}
          <FilterToolbar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search by company name or quote ID..."
          >
            <Typography sx={{ fontSize: "13px", color: "var(--text-secondary)" }}>Sort by:</Typography>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ height: "38px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card-secondary)", padding: "0 12px", fontSize: "13px", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="created_at">Created Date</option>
              <option value="lead.employer.employer_name">Company Name</option>
              <option value="total_premium">Monthly Premium</option>
            </select>
            <Button
              onClick={() => setSortOrder(prev => prev === "ASC" ? "DESC" : "ASC")}
              sx={{
                minWidth: "38px", height: "38px", p: 0,
                border: "1px solid var(--border)", borderRadius: "8px",
                color: "var(--text-primary)",
                "&:hover": { bgcolor: "var(--card-secondary)" }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sortOrder === "DESC" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </Button>
          </FilterToolbar>

          {/* Tabs */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px 0px" }}>
            {TABS.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? "contained" : "outlined"}
                sx={{
                  height: "32px",
                  px: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  textTransform: "none",
                  bgcolor: activeTab === tab.key ? "#1FC3EB" : "var(--card-secondary)",
                  borderColor: activeTab === tab.key ? "none" : "var(--border)",
                  color: activeTab === tab.key ? "#151515" : "var(--text-primary)",
                  "&:hover": {
                    bgcolor: activeTab === tab.key ? "#1AB3D9" : "var(--card-primary)",
                    borderColor: "var(--border)",
                  }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          {/* Quotes List */}
          <Stack spacing={2} sx={{ mb: "24px" }}>
            {quotes.length === 0 ? (
              <Box sx={{ textAlignment: "center", py: "48px" }}>
                <Typography sx={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "center" }}>No quotes in this category</Typography>
              </Box>
            ) : (
              quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onOpenMenu={(e) => handleOpenMenu(e, quote)}
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "24px", px: "12px" }}>
                <Typography sx={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Page {page} of {totalPages}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    sx={{
                      minWidth: "auto", px: "12px", height: "32px",
                      border: "1px solid var(--border)", borderRadius: "8px",
                      color: "var(--text-primary)", fontSize: "13px", textTransform: "none",
                      "&:disabled": { opacity: 0.5, borderColor: "var(--border)" }
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    sx={{
                      minWidth: "auto", px: "12px", height: "32px",
                      border: "1px solid var(--border)", borderRadius: "8px",
                      color: "var(--text-primary)", fontSize: "13px", textTransform: "none",
                      "&:disabled": { opacity: 0.5, borderColor: "var(--border)" }
                    }}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Global Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "var(--card-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            minWidth: "160px",
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeMenuQuote) {
              setDetailsQuoteId(activeMenuQuote.id);
            }
            handleCloseMenu();
          }}
          sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeMenuQuote) {
              handleMarkAsApproved(activeMenuQuote);
            }
            handleCloseMenu();
          }}
          sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}
        >
          Mark as Approved
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeMenuQuote) {
              handleCancelQuote(activeMenuQuote);
            }
            handleCloseMenu();
          }}
          sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}
        >
          Cancel Quote
        </MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}>
          Download
        </MenuItem>
      </Menu>

      {/* Lead Selection Modal */}
      <Dialog
        open={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setSelectedLead(null);
        }}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              bgcolor: "var(--card-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-primary)",
            }
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", p: "24px" }}>
          <Box component="span" sx={{ fontWeight: 500, fontSize: "1.25rem", color: "var(--text-primary)" }}>Generate New Quote</Box>
          <IconButton onClick={() => { setShowLeadModal(false); setSelectedLead(null); }} sx={{ color: "var(--text-secondary)" }}>
            <X size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: "24px", maxHeight: "60vh", overflowY: "auto" }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {leadsLoading ? (
              <Typography sx={{ color: "#A0A0A0", textAlign: "center", py: 2 }}>Loading leads...</Typography>
            ) : leads.length === 0 ? (
              <Typography sx={{ color: "#A0A0A0", textAlign: "center", py: 2 }}>No leads available</Typography>
            ) : (
              leads.map((lead) => (
                <Button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  sx={{
                    display: "block",
                    width: "100%",
                    p: "16px",
                    borderRadius: "10px",
                    textAlign: "left",
                    bgcolor: "var(--table-header-bg)",
                    border: selectedLead?.id === lead.id ? "2px solid #1FC3EB" : "1px solid var(--border)",
                    color: "var(--text-primary)",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "var(--border)",
                      borderColor: "#1FC3EB",
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "var(--text-primary)", mb: "4px" }}>
                    {lead.companyName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                    Employees: {lead.employees} • Status: {lead.status}
                  </Typography>
                </Button>
              ))
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid var(--border)", p: "24px", justifyContent: "flex-end" }}>
          <Button
            onClick={handleProceedWithQuote}
            disabled={!selectedLead}
            variant="contained"
            sx={{
              bgcolor: "#1FC3EB",
              color: "#0A0A0A",
              borderRadius: "8px",
              fontWeight: 700,
              textTransform: "none",
              px: "24px",
              height: "36px",
              "&:hover": {
                bgcolor: "#1AB3D9",
              },
              "&.Mui-disabled": {
                bgcolor: "var(--border)",
                color: "var(--text-secondary)",
              }
            }}
          >
            Proceed With Quote Generation
          </Button>
        </DialogActions>
      </Dialog>



      {/* Approve Quote Modal */}
      {showApproveModal && selectedQuoteForApproval && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedQuoteForApproval(null);
          }}
          quoteId={selectedQuoteForApproval.id}
          quoteReference={selectedQuoteForApproval.quoteId}
          companyName={selectedQuoteForApproval.companyName}
          contactFirstName={selectedQuoteForApproval.contactFirstName}
          contactLastName={selectedQuoteForApproval.contactLastName}
          contactEmail={selectedQuoteForApproval.contactEmail}
          contactMobile={selectedQuoteForApproval.contactMobile}
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

      {/* Quote Details Popup Modal */}
      {detailsQuoteId && (
        <QuoteDetailsPage
          quoteId={detailsQuoteId}
          onClose={() => setDetailsQuoteId(null)}
        />
      )}
    </Box>
  );
}
