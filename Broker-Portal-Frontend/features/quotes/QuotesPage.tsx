"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Plus, Search, ChevronDown, X } from "lucide-react";

import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import CancelQuoteModal from "@/components/quotes/CancelQuoteModal";
import CheckoutInfoModal from "@/components/quotes/CheckoutInfoModal";
import { getLeads, type Lead as ApiLead } from "@/lib/api/leads";
import { updateQuoteStatus, formatRand, saveOnboardingDetails, type Quote as ApiQuote } from "@/lib/api/quotes";
import { getRepresentativeId } from "@/lib/auth";
import { QuoteStatus, QuoteType } from "@/lib/enums";

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

export default function QuotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "onboarding" | "approved" | "pending" | "cancelled">("new");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuQuote, setActiveMenuQuote] = useState<Quote | null>(null);

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
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

  // Load leads (for the "Add New Quote" modal) and fetch actual quotes
  const load = useCallback(async (isInitial = false) => {
    if (isInitial) setLeadsLoading(true);
    try {
      const representativeId = getRepresentativeId() ?? undefined;
      
      // 1. Load leads for the "New Quote" selection modal
      const apiLeads = await getLeads(representativeId);
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

      // 2. Load actual quotes from the quotes API
      const { getQuotes } = await import("@/lib/api/quotes");
      
      const filters: any = {};
      if (searchQuery) {
        filters.search = searchQuery;
        filters.searchFields = "quote_reference";
        filters.clientName = searchQuery;
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
    } catch (err) {
      console.error("Failed to load quotes:", err);
    } finally {
      if (isInitial) setLeadsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;


    load(true);
    intervalId = setInterval(() => load(false), 10000);

    return () => clearInterval(intervalId);
  }, [load]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, quote: Quote) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuQuote(quote);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenuQuote(null);
  };

  const filteredQuotes = quotes.filter((quote) => quote.status === activeTab);

  const tabs = [
    { key: "new" as const, label: `New Quotes (${quotes.filter(q => q.status === "new").length})` },
    { key: "pending" as const, label: `Awaiting Acceptance (${quotes.filter(q => q.status === "pending").length})` },
    { key: "onboarding" as const, label: `In Onboarding (${quotes.filter(q => q.status === "onboarding").length})` },
    { key: "cancelled" as const, label: `Cancelled (${quotes.filter(q => q.status === "cancelled").length})` },
    { key: "approved" as const, label: `Expired (${quotes.filter(q => q.status === "approved").length})` },
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
    setShowCheckoutModal(true);
  };

  const handleCheckoutNext = async (onboardingData: any) => {
    if (selectedQuoteForApproval) {
      try {
        await saveOnboardingDetails(selectedQuoteForApproval.id, onboardingData);
        setShowCheckoutModal(false);
        setShowApproveModal(true);
      } catch (err) {
        console.error("Failed to save onboarding details:", err);
        alert(err instanceof Error ? err.message : "Failed to save onboarding details. Please try again.");
      }
    }
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
    load(false); // Trigger immediate non-blocking refresh of quotes list!
  };

  return (
    <Box sx={{ position: "relative", width: "100%", h: "100%" }}>
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

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px", px: "24px", pt: "24px" }}>
        <Typography variant="h1" sx={{ fontSize: "20px", fontWeight: 500, color: "#FFFFFF" }}>
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
        {/* Search Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>Search Quotes</Typography>
          <TextField
            fullWidth
            placeholder="Search by company name or quote ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#A0A0A0" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "44px",
                bgcolor: "#2D2D2D",
              }
            }}
          />
        </Box>

        {/* Tabs */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px 0px" }}>
          {tabs.map((tab) => (
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
                bgcolor: activeTab === tab.key ? "#1FC3EB" : "rgba(58,58,58,0.3)",
                borderColor: activeTab === tab.key ? "none" : "#3A3A3A",
                color: activeTab === tab.key ? "#151515" : "#FFFFFF",
                "&:hover": {
                  bgcolor: activeTab === tab.key ? "#1AB3D9" : "rgba(58,58,58,0.5)",
                  borderColor: "#3A3A3A",
                }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* Quotes List */}
        <Stack spacing={2} sx={{ mb: "24px" }}>
          {filteredQuotes.length === 0 ? (
            <Box sx={{ textAlignment: "center", py: "48px" }}>
              <Typography sx={{ color: "#A0A0A0", fontSize: "14px", textAlign: "center" }}>No quotes in this category</Typography>
            </Box>
          ) : (
            filteredQuotes.map((quote) => (
              <Card
                key={quote.id}
                sx={{
                  bgcolor: "#1E1E1E",
                  border: "1px solid #4A4A4A",
                  borderRadius: "10px",
                  p: "24px",
                  boxShadow: "none",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  {/* Left Section */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Company Name & Badges */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <Typography variant="h3" sx={{ fontSize: "18px", fontWeight: 500, color: "#FFFFFF", m: 0 }}>
                        {quote.companyName}
                      </Typography>
                      
                      <Chip
                        label={quote.quoteType}
                        sx={{
                          height: "22px",
                          bgcolor: quote.quoteType === "Quick Quote" ? "rgba(43,127,255,0.1)" : "rgba(31,195,235,0.1)",
                          border: quote.quoteType === "Quick Quote" ? "1px solid rgba(43,127,255,0.2)" : "1px solid rgba(31,195,235,0.2)",
                          color: quote.quoteType === "Quick Quote" ? "#2B7FFF" : "#1FC3EB",
                          fontSize: "12px",
                          fontWeight: 500,
                          "& .MuiChip-label": { px: "8px" }
                        }}
                      />

                      <Chip
                        label={`${quote.daysRemaining} days remaining`}
                        sx={{
                          height: "22px",
                          bgcolor: "transparent",
                          border: "1px solid #4A4A4A",
                          color: "#FFFFFF",
                          fontSize: "12px",
                          fontWeight: 500,
                          "& .MuiChip-label": { px: "8px" }
                        }}
                      />
                    </Box>

                    {/* Quote Details Grid */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Quote ID</Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quote.quoteId}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Monthly Premium</Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#1FC3EB" }}>{quote.monthlyPremium}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Coverage Amount</Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quote.coverageAmount}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Created Date</Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quote.createdDate}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Actions Button */}
                  <Box>
                    <Button
                      variant="outlined"
                      endIcon={<ChevronDown size={20} />}
                      onClick={(e) => handleOpenMenu(e, quote)}
                      sx={{
                        height: "36px",
                        bgcolor: "rgba(58,58,58,0.3)",
                        borderColor: "#3A3A3A",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "rgba(58,58,58,0.5)",
                          borderColor: "#3A3A3A",
                        }
                      }}
                    >
                      Actions
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))
          )}
        </Stack>
      </Box>

      {/* Global Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "#262626",
            border: "1px solid #3A3A3A",
            color: "#FFFFFF",
            minWidth: "160px",
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeMenuQuote) {
              const params = new URLSearchParams({
                companyName: activeMenuQuote.companyName,
                quoteType: activeMenuQuote.quoteType,
                quoteId: activeMenuQuote.quoteId,
                monthlyPremium: activeMenuQuote.monthlyPremium,
                coverageAmount: activeMenuQuote.coverageAmount,
                createdDate: activeMenuQuote.createdDate,
              });
              router.push(`/quotes/${activeMenuQuote.id}?${params.toString()}`);
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
              bgcolor: "#1E1E1E",
              border: "1px solid #4A4A4A",
              borderRadius: "10px",
              color: "#FFFFFF",
            }
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #4A4A4A", p: "24px" }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#FFFFFF" }}>Generate New Quote</Typography>
          <IconButton onClick={() => { setShowLeadModal(false); setSelectedLead(null); }} sx={{ color: "#A0A0A0" }}>
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
                    bgcolor: "rgba(58,58,58,0.5)",
                    border: selectedLead?.id === lead.id ? "2px solid #1FC3EB" : "1px solid #4A4A4A",
                    color: "#FFFFFF",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "rgba(58,58,58,0.7)",
                      borderColor: "#1FC3EB",
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#FFFFFF", mb: "4px" }}>
                    {lead.companyName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#A0A0A0" }}>
                    Employees: {lead.employees} • Status: {lead.status}
                  </Typography>
                </Button>
              ))
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid #4A4A4A", p: "24px", justifyContent: "flex-end" }}>
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
                bgcolor: "#3A3A3A",
                color: "#6B6B6B",
              }
            }}
          >
            Proceed With Quote Generation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Info Modal - The new step */}
      {showCheckoutModal && selectedQuoteForApproval && (
        <CheckoutInfoModal
          isOpen={showCheckoutModal}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedQuoteForApproval(null);
          }}
          quoteId={selectedQuoteForApproval.quoteReference}
          companyName={selectedQuoteForApproval.companyName}
          onNext={handleCheckoutNext}
        />
      )}

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
    </Box>
  );
}
