"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
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

  // Fallback values from URL params
  const companyNameParam = searchParams.get("companyName") || "Unknown Company";
  const quoteTypeParam = searchParams.get("quoteType") || "Quick Quote";
  const quoteIdParam = searchParams.get("quoteId") || "N/A";
  const monthlyPremiumParam = searchParams.get("monthlyPremium") || "R 0";
  const coverageAmountParam = searchParams.get("coverageAmount") || "R 0";
  const createdDateParam = searchParams.get("createdDate") || "N/A";

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
        // fall back
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [quoteReference]);

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
    <>
      <Dialog
        open={true}
        onClose={() => router.back()}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#1E1E1E",
              border: "0.625px solid #4A4A4A",
              borderRadius: "10px",
              color: "#FFFFFF",
              p: "24px",
            }
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: "48px" }}>
            <Typography sx={{ color: "#A0A0A0", fontSize: "14px" }}>Loading quote details...</Typography>
          </Box>
        ) : (
          <>
            {/* Title / Header */}
            <DialogTitle sx={{ p: 0, display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 500, color: "#FFFFFF" }}>
                  Quote Details
                </Typography>
                <Chip
                  label={quoteType}
                  sx={{
                    height: "22px",
                    bgcolor: quoteType === "Quick Quote" ? "rgba(43,127,255,0.1)" : "rgba(31,195,235,0.1)",
                    border: quoteType === "Quick Quote" ? "1px solid rgba(43,127,255,0.2)" : "1px solid rgba(31,195,235,0.2)",
                    color: quoteType === "Quick Quote" ? "#2B7FFF" : "#1FC3EB",
                    fontSize: "12px",
                    fontWeight: 500,
                    "& .MuiChip-label": { px: "8px" }
                  }}
                />
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  sx={{
                    bgcolor: "rgba(58, 58, 58, 0.3)",
                    borderColor: "#3A3A3A",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 500,
                    textTransform: "none",
                    height: "36px",
                    px: "16px",
                    borderRadius: "8px",
                    "&:hover": {
                      bgcolor: "rgba(80,80,80,0.5)",
                      borderColor: "#4A4A4A",
                    }
                  }}
                >
                  Download
                </Button>
                <IconButton
                  onClick={() => router.back()}
                  sx={{
                    bgcolor: "rgba(58, 58, 58, 0.3)",
                    border: "0.625px solid #3A3A3A",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    "&:hover": {
                      bgcolor: "rgba(80,80,80,0.5)",
                    }
                  }}
                >
                  <X size={20} />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Company Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#1FC3EB" }}>
                  Company Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Company Name</Typography>
                    <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{quoteData.companyName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Registration Number</Typography>
                    <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{quoteData.registrationNumber}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#3A3A3A" }} />

              {/* Quote Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#1FC3EB" }}>
                  Quote Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Employees Covered</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quoteData.employeesCovered}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Average Age</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quoteData.averageAge}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Average Income</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quoteData.averageIncome}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Gender Split</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", textTransform: "capitalize" }}>{quoteData.genderSplit}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Province</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", textTransform: "capitalize" }}>{quoteData.province}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Industry</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", textTransform: "capitalize" }}>{quoteData.industry}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#3A3A3A" }} />

              {/* Scheme Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#1FC3EB" }}>
                  Scheme Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Scheme</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quoteData.scheme}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Benefits</Typography>
                    <Typography sx={{ fontSize: "14px", color: "#FFFFFF", lineHeight: 1.25 }}>{quoteData.benefits.join(" ")}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Value Added Services</Typography>
                    <Typography sx={{ fontSize: "14px", color: "#FFFFFF", lineHeight: 1.25 }}>{quoteData.valueAddedServices.join(" ")}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#3A3A3A" }} />

              {/* Premium Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#1FC3EB" }}>
                  Premium Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Estimated Monthly Premium</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#1FC3EB" }}>{quoteData.monthlyPremium}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Total Coverage Amount</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quoteData.coverageAmount}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Deductible</Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF" }}>{quoteData.deductible}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Coverage Details - Only for Full Quote or after conversion */}
              {isFullQuote && (
                <>
                  <Divider sx={{ borderColor: "#3A3A3A" }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Typography sx={{ fontSize: "18px", fontWeight: 500, color: "#FFFFFF" }}>
                      Coverage Details
                    </Typography>
                    <Grid container spacing={2}>
                      {/* Life Cover Card */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{ bgcolor: "rgba(58, 58, 58, 0.5)", p: "16px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "none" }}>
                          <Typography sx={{ fontSize: "14px", color: "#A0A0A0" }}>Life Cover</Typography>
                          <Typography sx={{ fontSize: "20px", fontWeight: 500, color: "#FFFFFF" }}>R 0.5x monthly salary</Typography>
                          <Typography sx={{ fontSize: "12px", color: "#A0A0A0" }}>Avg of R 6,000.00 per employee</Typography>
                        </Card>
                      </Grid>

                      {/* Funeral Cover Card */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{ bgcolor: "rgba(58, 58, 58, 0.5)", p: "16px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "none" }}>
                          <Typography sx={{ fontSize: "14px", color: "#A0A0A0" }}>Funeral Cover</Typography>
                          <Typography sx={{ fontSize: "20px", fontWeight: 500, color: "#FFFFFF" }}>R 20,000</Typography>
                          <Typography sx={{ fontSize: "12px", color: "#A0A0A0" }}>per employee</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </DialogContent>

            {/* Action Buttons */}
            <DialogActions sx={{ p: 0, pt: "16px", justifyContent: "flex-end", gap: "16px" }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#0A0A0A",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textTransform: "none",
                  height: "36px",
                  px: "16px",
                  "&:hover": {
                    bgcolor: "#E6E6E6",
                  }
                }}
              >
                Download Quote
              </Button>

              {quoteType === "Quick Quote" && !convertedToFull ? (
                <Button
                  onClick={() => setConvertedToFull(true)}
                  variant="contained"
                  sx={{
                    bgcolor: "#1FC3EB",
                    color: "#0A0A0A",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                    height: "36px",
                    px: "16px",
                    "&:hover": {
                      bgcolor: "#1AB3D9",
                    }
                  }}
                >
                  Convert to Full Quote
                </Button>
              ) : (
                <Button
                  onClick={() => setShowApproveModal(true)}
                  variant="contained"
                  sx={{
                    bgcolor: "#1FC3EB",
                    color: "#0A0A0A",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "none",
                    height: "36px",
                    px: "16px",
                    "&:hover": {
                      bgcolor: "#1AB3D9",
                    }
                  }}
                >
                  Approve Quote
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Approve Quote Modal */}
      {showApproveModal && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          quoteId={quoteId}
          quoteReference={quoteReference}
          companyName={companyName}
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
