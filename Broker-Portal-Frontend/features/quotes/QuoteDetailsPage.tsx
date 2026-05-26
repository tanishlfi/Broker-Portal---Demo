"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import { Download, X, RefreshCw } from "lucide-react";

import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import { getQuotes, updateQuoteStatus, formatRand, type Quote as ApiQuote } from "@/lib/api/quotes";
import { getRepresentativeId } from "@/lib/auth";

interface QuoteDetailsPageProps {
  quoteId?: string | null;
  onClose?: () => void;
}

// Type-safe quote data structure
interface QuoteData {
  companyName: string;
  quoteType: string;
  quoteId: string;
  quoteReference: string;
  monthlyPremium: string;
  coverageAmount: string;
  createdDate: string;
  registrationNumber: string;
  employeesCovered: string;
  averageAge: string;
  averageIncome: string;
  genderSplit: string;
  province: string;
  industry: string;
  scheme: string;
  benefits: string[];
  valueAddedServices: string[];
  deductible: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactMobile: string;
}

// Field configuration with proper typing
interface FieldConfigItem {
  key: keyof QuoteData;
  label: string;
  gridSize: { xs: number; sm: number };
  capitalize?: boolean;
  color?: string;
}

// Style constants
const STYLES = {
  button: {
    primary: {
      bgcolor: "#1FC3EB",
      color: "#0A0A0A",
      borderRadius: "8px",
      fontWeight: 700,
      fontSize: "14px",
      textTransform: "none" as const,
      height: "36px",
      px: "16px",
      "&:hover": {
        bgcolor: "#1AB3D9",
      },
      "&:disabled": {
        bgcolor: "rgba(31, 195, 235, 0.3)",
        color: "rgba(10, 10, 10, 0.5)",
      }
    },
    secondary: {
      bgcolor: "var(--text-primary)",
      color: "var(--card-primary)",
      borderRadius: "8px",
      fontWeight: 700,
      fontSize: "14px",
      textTransform: "none" as const,
      height: "36px",
      px: "16px",
      "&:hover": {
        bgcolor: "var(--text-secondary)",
      },
      "&:disabled": {
        bgcolor: "var(--text-secondary)",
        color: "rgba(255, 255, 255, 0.3)",
      }
    },
    outlined: {
      bgcolor: "transparent",
      borderColor: "var(--border)",
      color: "var(--text-primary)",
      fontSize: "14px",
      fontWeight: 500,
      textTransform: "none" as const,
      height: "36px",
      px: "16px",
      borderRadius: "8px",
      "&:hover": {
        bgcolor: "var(--border)",
        borderColor: "var(--border)",
      },
      "&:disabled": {
        borderColor: "var(--border)",
        color: "var(--text-secondary)",
        opacity: 0.5,
      }
    }
  },
  chip: {
    quickQuote: {
      height: "22px",
      bgcolor: "rgba(43,127,255,0.1)",
      border: "1px solid rgba(43,127,255,0.2)",
      color: "#2B7FFF",
      fontSize: "12px",
      fontWeight: 500,
      "& .MuiChip-label": { px: "8px" }
    },
    fullQuote: {
      height: "22px",
      bgcolor: "rgba(31,195,235,0.1)",
      border: "1px solid rgba(31,195,235,0.2)",
      color: "#1FC3EB",
      fontSize: "12px",
      fontWeight: 500,
      "& .MuiChip-label": { px: "8px" }
    }
  },
  typography: {
    sectionTitle: {
      fontSize: "16px",
      fontWeight: 700,
      color: "var(--primary)"
    },
    label: {
      fontSize: "14px",
      color: "var(--text-secondary)",
      mb: "4px"
    },
    value: {
      fontSize: "14px",
      fontWeight: 500,
      color: "var(--text-primary)"
    }
  }
} as const;

// Field configuration for rendering
const FIELD_CONFIG: {
  companyDetails: FieldConfigItem[];
  quoteDetails: FieldConfigItem[];
  premiumDetails: FieldConfigItem[];
} = {
  companyDetails: [
    { key: "companyName", label: "Company Name", gridSize: { xs: 12, sm: 6 } },
    { key: "registrationNumber", label: "Registration Number", gridSize: { xs: 12, sm: 6 } }
  ],
  quoteDetails: [
    { key: "employeesCovered", label: "Employees Covered", gridSize: { xs: 6, sm: 4 } },
    { key: "averageAge", label: "Average Age", gridSize: { xs: 6, sm: 4 } },
    { key: "averageIncome", label: "Average Income", gridSize: { xs: 6, sm: 4 } },
    { key: "genderSplit", label: "Gender Split", gridSize: { xs: 6, sm: 4 }, capitalize: true },
    { key: "province", label: "Province", gridSize: { xs: 6, sm: 4 }, capitalize: true },
    { key: "industry", label: "Industry", gridSize: { xs: 6, sm: 4 }, capitalize: true }
  ],
  premiumDetails: [
    { key: "monthlyPremium", label: "Estimated Monthly Premium", gridSize: { xs: 12, sm: 4 }, color: "#1FC3EB" },
    { key: "coverageAmount", label: "Total Coverage Amount", gridSize: { xs: 12, sm: 4 } },
    { key: "deductible", label: "Deductible", gridSize: { xs: 12, sm: 4 } }
  ]
};

const COVERAGE_CARDS = [
  {
    title: "Life Cover",
    amount: "R 0.5x monthly salary",
    subtitle: "Avg of R 6,000.00 per employee"
  },
  {
    title: "Funeral Cover",
    amount: "R 20,000",
    subtitle: "per employee"
  }
] as const;

// Helper to transform API quote to QuoteData
const transformQuoteData = (apiQuote: ApiQuote | null, quoteIdProp?: string | null): QuoteData => ({
  companyName: apiQuote?.companyName ?? "Unknown Company",
  quoteType: apiQuote?.quoteType ?? "Quick Quote",
  quoteId: apiQuote?.quoteId ?? quoteIdProp ?? "",
  quoteReference: apiQuote?.quoteReference ?? "N/A",
  monthlyPremium: apiQuote ? formatRand(apiQuote.monthlyPremium) : "R 0",
  coverageAmount: apiQuote ? formatRand(apiQuote.coverageAmount) : "R 0",
  createdDate: apiQuote?.createdAt ? new Date(apiQuote.createdAt).toLocaleDateString("en-ZA") : "N/A",
  registrationNumber: apiQuote?.registrationNumber ?? "—",
  employeesCovered: String(apiQuote?.numberOfEmployees ?? "—"),
  averageAge: apiQuote?.averageAge ? String(apiQuote.averageAge) : "—",
  averageIncome: apiQuote?.averageMonthlyIncome ? formatRand(apiQuote.averageMonthlyIncome) : "—",
  genderSplit: apiQuote?.genderSplit ?? "—",
  province: apiQuote?.province ?? "—",
  industry: apiQuote?.industry ?? "—",
  scheme: apiQuote?.scheme ?? "Group Life",
  benefits: apiQuote?.benefits ?? ["Group Life Cover", "Accidental Cover (GPA)", "Funeral Cover"],
  valueAddedServices: apiQuote?.valueAddedServices ?? ["Repatriation", "Funeral Assistance", "Groceries Benefit", "Airtime Benefit"],
  deductible: apiQuote?.deductible ? formatRand(apiQuote.deductible) : "—",
  contactFirstName: apiQuote?.contactFirstName ?? "—",
  contactLastName: apiQuote?.contactLastName ?? "",
  contactEmail: apiQuote?.contactEmail ?? "—",
  contactMobile: apiQuote?.contactMobile ?? "—",
});

export default function QuoteDetailsPage({ quoteId: quoteIdProp, onClose }: QuoteDetailsPageProps = {}) {
  const router = useRouter();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [convertedToFull, setConvertedToFull] = useState(false);
  const [apiQuote, setApiQuote] = useState<ApiQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router]);

  const fetchQuote = useCallback(async () => {
    if (!quoteIdProp || quoteIdProp === "N/A") {
      setLoading(false);
      setError("No quote ID provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const representativeId = getRepresentativeId() ?? undefined;
      const data = await getQuotes(representativeId);
      const foundQuote = data.find(
        (q: ApiQuote) => q.quoteId === quoteIdProp || q.quoteReference === quoteIdProp
      );

      if (foundQuote) {
        setApiQuote(foundQuote);
      } else {
        setError("Quote not found");
      }
    } catch (err) {
      console.error("Failed to fetch quote details:", err);
      setError("Failed to load quote details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [quoteIdProp]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const quoteData = transformQuoteData(apiQuote, quoteIdProp);
  const isFullQuote = quoteData.quoteType === "Full Quote" || convertedToFull;

  const handleApproveSuccess = async () => {
    setIsApproving(true);
    try {
      await updateQuoteStatus(quoteData.quoteId, "approved");
      setShowApproveModal(false);
      router.push("/quotes?tab=approved");
    } catch (err) {
      console.error("Failed to approve quote:", err);
      setError("Failed to approve quote. Please try again.");
      setShowApproveModal(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownload = useCallback(() => {
    // TODO: Implement download functionality
    console.log("Download quote:", quoteData.quoteId);
    // Example: window.open(`/api/quotes/${quoteData.quoteId}/download`, '_blank');
  }, [quoteData.quoteId]);

  const renderField = (field: FieldConfigItem) => (
    <Grid key={field.key} size={field.gridSize}>
      <Typography sx={STYLES.typography.label}>{field.label}</Typography>
      <Typography
        sx={{
          ...STYLES.typography.value,
          ...(field.capitalize ? { textTransform: "capitalize" } : {}),
          ...(field.color ? { color: field.color } : {})
        }}
      >
        {quoteData[field.key]}
      </Typography>
    </Grid>
  );

  const renderSection = (title: string, fields: FieldConfigItem[]) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Typography sx={STYLES.typography.sectionTitle}>{title}</Typography>
      <Grid container spacing={2}>
        {fields.map(renderField)}
      </Grid>
    </Box>
  );

  const renderCoverageCard = (card: typeof COVERAGE_CARDS[number]) => (
    <Grid key={card.title} size={{ xs: 12, sm: 6 }}>
      <Card sx={{
        bgcolor: "var(--table-header-bg)",
        border: "1px solid var(--border)",
        p: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        boxShadow: "none"
      }}>
        <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          {card.title}
        </Typography>
        <Typography sx={{ fontSize: "20px", fontWeight: 500, color: "var(--text-primary)" }}>
          {card.amount}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {card.subtitle}
        </Typography>
      </Card>
    </Grid>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: "48px" }}>
          <Typography sx={{ color: "#A0A0A0", fontSize: "14px" }}>
            Loading quote details...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", py: "48px" }}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
          {error !== "No quote ID provided" && (
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={fetchQuote}
              sx={STYLES.button.outlined}
            >
              Retry
            </Button>
          )}
        </Box>
      );
    }

    return (
      <>
        {/* Title / Header */}
        <DialogTitle sx={{ p: 0, display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 500, color: "var(--text-primary)" }}>
              Quote Details
            </Typography>
            <Chip
              label={quoteData.quoteType}
              sx={quoteData.quoteType === "Quick Quote" ? STYLES.chip.quickQuote : STYLES.chip.fullQuote}
            />
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              onClick={handleDownload}
              sx={STYLES.button.outlined}
              aria-label="Download quote document"
            >
              Download
            </Button>
            <IconButton
              onClick={handleClose}
              aria-label="Close quote details"
              sx={{
                bgcolor: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                "&:hover": {
                  bgcolor: "var(--border)",
                }
              }}
            >
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Company Details */}
          {renderSection("Company Details", FIELD_CONFIG.companyDetails)}

          <Divider sx={{ borderColor: "var(--border)" }} />

          {/* Quote Details */}
          {renderSection("Quote Details", FIELD_CONFIG.quoteDetails)}

          <Divider sx={{ borderColor: "var(--border)" }} />

          {/* Premium Details */}
          {renderSection("Premium Details", FIELD_CONFIG.premiumDetails)}

          {/* Coverage Details - Only for Full Quote or after conversion */}
          {isFullQuote && (
            <>
              <Divider sx={{ borderColor: "var(--border)" }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)" }}>
                  Coverage Details
                </Typography>
                <Grid container spacing={2}>
                  {COVERAGE_CARDS.map(renderCoverageCard)}
                </Grid>
              </Box>
            </>
          )}
        </DialogContent>

        {/* Action Buttons */}
        <DialogActions sx={{ p: 0, pt: "16px", justifyContent: "flex-end", gap: "16px" }}>
          <Button
            variant="contained"
            onClick={handleDownload}
            sx={STYLES.button.secondary}
            aria-label="Download quote as PDF"
          >
            Download Quote
          </Button>

          {quoteData.quoteType === "Quick Quote" && !convertedToFull ? (
            <Button
              onClick={() => setConvertedToFull(true)}
              variant="contained"
              sx={STYLES.button.primary}
              aria-label="Convert quick quote to full quote"
            >
              Convert to Full Quote
            </Button>
          ) : (
            <Button
              onClick={() => setShowApproveModal(true)}
              variant="contained"
              disabled={isApproving}
              sx={STYLES.button.primary}
              aria-label="Approve quote and proceed"
            >
              {isApproving ? "Approving..." : "Approve Quote"}
            </Button>
          )}
        </DialogActions>
      </>
    );
  };

  return (
    <>
      <Dialog
        open={true}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        aria-labelledby="quote-details-title"
        aria-describedby="quote-details-content"
        slotProps={{
          backdrop: {
            sx: {
              background: "rgba(11, 11, 11, 0.72)",
              backdropFilter: "blur(10.5px)",
            }
          },
          paper: {
            sx: {
              bgcolor: "var(--card-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              p: "24px",
            }
          }
        }}
      >
        {renderContent()}
      </Dialog>

      {/* Approve Quote Modal */}
      {showApproveModal && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          quoteId={quoteData.quoteId}
          quoteReference={quoteData.quoteReference}
          companyName={quoteData.companyName}
          contactFirstName={quoteData.contactFirstName}
          contactLastName={quoteData.contactLastName}
          contactEmail={quoteData.contactEmail}
          contactMobile={quoteData.contactMobile}
          onSendOTP={handleApproveSuccess}
        />
      )}
    </>
  );
}