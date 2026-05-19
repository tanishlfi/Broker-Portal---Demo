"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Plus } from "lucide-react";

import { getLeads, cancelLead, Lead } from "@/lib/api/leads";
import { ROUTES } from "@/lib/constants";
import { getRepresentativeId } from "@/lib/auth";

interface LeadDetailsPageProps {
  leadId: string;
}

interface Quote {
  quoteId: string;
  quoteReference: string;
  companyName: string;
  quoteType: "Quick Quote" | "Full Quote";
  status: string;
  monthlyPremium: number;
  coverageAmount: number;
  createdAt: string;
}

// Mock quotes data
const MOCK_QUOTES: Quote[] = [
  {
    quoteId: "Q-LEAD-1744147200000-847",
    quoteReference: "Q-LEAD-1744147200000-847",
    companyName: "Tech Innovations Pty Ltd",
    quoteType: "Quick Quote",
    status: "Expired",
    monthlyPremium: 26629,
    coverageAmount: 395666,
    createdAt: "2026-05-04",
  },
  {
    quoteId: "Q-LEAD-1744147200000-848",
    quoteReference: "Q-LEAD-1744147200000-848",
    companyName: "Tech Innovations Pty Ltd",
    quoteType: "Quick Quote",
    status: "Expired",
    monthlyPremium: 26629,
    coverageAmount: 395666,
    createdAt: "2026-05-04",
  },
  {
    quoteId: "Q-LEAD-1744147200000-849",
    quoteReference: "Q-LEAD-1744147200000-849",
    companyName: "Tech Innovations Pty Ltd",
    quoteType: "Full Quote",
    status: "Cancelled",
    monthlyPremium: 26629,
    coverageAmount: 395666,
    createdAt: "2026-05-04",
  },
];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

function QuoteBadge({ type, status }: { type: string; status?: string }) {
  const typeStyles: Record<string, { bg: string; color: string }> = {
    "Quick Quote": { bg: "#4A4A4A", color: "#FFFFFF" },
    "Full Quote": { bg: "#767676", color: "#FFFFFF" },
  };
  
  const statusStyles: Record<string, { color: string }> = {
    "Expired": { color: "#FE7F7F" },
    "Cancelled": { color: "#FE7F7F" },
    "Active": { color: "#1FC3EB" },
  };

  const typeStyle = typeStyles[type] || { bg: "#4A4A4A", color: "#FFFFFF" };
  const statusStyle = statusStyles[status || ""] || { color: "#A0A0A0" };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Chip
        label={type}
        sx={{
          bgcolor: typeStyle.bg,
          color: typeStyle.color,
          border: "0.625px solid rgba(237, 237, 237, 0.2)",
          borderRadius: "4px",
          height: "22px",
          fontSize: "12px",
          fontWeight: 500,
          "& .MuiChip-label": { px: "8px" },
        }}
      />
      {status && (
        <Chip
          label={status}
          sx={{
            bgcolor: "transparent",
            color: statusStyle.color,
            border: "0.625px solid #4A4A4A",
            borderRadius: "8px",
            height: "22px",
            fontSize: "12px",
            fontWeight: 500,
            "& .MuiChip-label": { px: "8px" },
          }}
        />
      )}
    </Box>
  );
}

export default function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const representativeId = getRepresentativeId() ?? undefined;
        const data = await getLeads(representativeId);
        const foundLead = data.find((l: Lead) => l.leadId === leadId);
        
        if (foundLead) {
          setLead(foundLead);
        }
      } catch (error) {
        console.error("Could not fetch lead from API:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId]);

  if (loading || !lead) {
    return (
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        color: "#A0A0A0",
      }}>
        Loading lead details...
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100vh - 120px)",
        background: "rgba(24, 24, 24, 0.8)",
        border: "1px solid rgba(29, 51, 68, 0.4)",
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background blur */}
      <Box sx={{
        position: "absolute",
        width: "608px",
        height: "608px",
        right: "-100px",
        bottom: "-100px",
        background: "#00C0E8",
        opacity: 0.05,
        filter: "blur(172px)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <Box sx={{ position: "relative", zIndex: 1 }}>

        {/* Lead Details Header with Action Buttons */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <Typography variant="h2" sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "36px",
            letterSpacing: "0.0703125px",
            color: "#FFFFFF",
            margin: 0,
          }}>
            Lead Details
          </Typography>
          
          <Box sx={{
            display: "flex",
            gap: "12px",
          }}>
            {/* Mark as Cancelled Button */}
            <Button
              onClick={async () => {
                const reason = prompt("Please provide a reason for cancelling this lead (min 5 characters):");
                if (reason !== null) {
                  if (reason.length < 5) {
                    alert("Reason must be at least 5 characters.");
                    return;
                  }
                  try {
                    await cancelLead(leadId, reason);
                    setLead(prev => prev ? { ...prev, status: "Cancelled" } : null);
                    alert("Lead cancelled successfully.");
                  } catch (err: any) {
                    console.error("Failed to cancel lead:", err);
                    alert(err.message || "Failed to cancel lead.");
                  }
                }
              }}
              variant="contained"
              sx={{
                bgcolor: "#FF6C6C",
                color: "#0A0A0A",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "none",
                width: "150px",
                height: "40px",
                "&:hover": {
                  bgcolor: "#FF5252",
                },
              }}
            >
              Mark as Cancelled
            </Button>

            {/* New Quote Button */}
            <Button
              onClick={() => {
                router.push(`/quotes/new?leadId=${leadId}${lead ? `&ref=${lead.leadReference}&company=${encodeURIComponent(lead.employerName)}` : ""}`);
              }}
              variant="contained"
              startIcon={<Plus size={20} />}
              sx={{
                bgcolor: "#1FC3EB",
                color: "#0A0A0A",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "none",
                width: "135px",
                height: "40px",
                "&:hover": {
                  bgcolor: "#0DB5D8",
                },
                "& .MuiButton-startIcon": {
                  color: "#0A0A0A",
                }
              }}
            >
              New Quote
            </Button>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ borderColor: "#101D28", marginBottom: "31px" }} />

        {/* Lead Details Card */}
        <Card sx={{
          boxSizing: "border-box",
          background: "#1E1E1E",
          border: "1px solid #30363D",
          borderRadius: "12px",
          p: "25px",
          marginBottom: "31px",
          boxShadow: "none",
        }}>
          {/* Employer Details */}
          <Box sx={{ marginBottom: "40px" }}>
            <Typography variant="h3" sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#E6E6E6",
              margin: "0 0 12px 0",
            }}>
              Employer Details
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Company Name</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 500 }}>{lead.employerName}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Registration Number</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{lead.registrationNumber || "N/A"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Industry</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF", textTransform: "capitalize" }}>{(lead as any).industry || "N/A"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Number of Employees</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{lead.numberOfEmployees}</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Address</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{(lead as any).address || "N/A"}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ borderColor: "#4A4A4A", my: "25px" }} />

          {/* Contact Details */}
          <Box>
            <Typography variant="h3" sx={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#E6E6E6",
              margin: "0 0 12px 0",
            }}>
              Contact Details
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Contact Person</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 500 }}>{lead.contactFirstName} {lead.contactLastName}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Position</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{(lead as any).contactPosition || "N/A"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Email</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{lead.contactEmail}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Phone</Typography>
                <Typography sx={{ fontSize: "14px", color: "#FFFFFF" }}>{(lead as any).contactPhone || "N/A"}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Previous Quotes Section */}
        <Typography variant="h2" sx={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "18px",
          fontWeight: 500,
          lineHeight: "36px",
          letterSpacing: "0.0703125px",
          color: "#FFFFFF",
          margin: "0 0 17px 0",
        }}>
          Previous Quotes
        </Typography>

        <Stack spacing={2}>
          {quotes.map((quote) => (
            <Card key={quote.quoteId} sx={{
              boxSizing: "border-box",
              background: "#1E1E1E",
              border: "0.625px solid #4A4A4A",
              borderRadius: "10px",
              p: "25px",
              boxShadow: "none",
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  {/* Quote Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <Typography variant="h3" sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "18px",
                      fontWeight: 500,
                      lineHeight: "27px",
                      letterSpacing: "-0.439453px",
                      color: "#FFFFFF",
                      margin: 0,
                    }}>
                      {quote.companyName}
                    </Typography>
                    <QuoteBadge type={quote.quoteType} status={quote.status} />
                  </Box>

                  {/* Quote Details */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Quote ID</Typography>
                      <Typography sx={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 500 }}>{quote.quoteReference}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Monthly Premium</Typography>
                      <Typography sx={{ fontSize: "14px", color: "#1FC3EB", fontWeight: 500 }}>R {quote.monthlyPremium.toLocaleString()}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Coverage Amount</Typography>
                      <Typography sx={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 500 }}>R {quote.coverageAmount.toLocaleString()}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Typography sx={{ fontSize: "14px", color: "#A0A0A0", mb: "4px" }}>Created Date</Typography>
                      <Typography sx={{ fontSize: "14px", color: "#FFFFFF", fontWeight: 500 }}>{fmt(quote.createdAt)}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Download Button */}
                <Button
                  variant="outlined"
                  sx={{
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    width: "137px",
                    height: "36px",
                    background: "rgba(58, 58, 58, 0.3)",
                    border: "0.625px solid #3A3A3A",
                    borderRadius: "8px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    textTransform: "none",
                    color: "#FFFFFF",
                    "&:hover": {
                      bgcolor: "rgba(80,80,80,0.5)",
                      borderColor: "#4A4A4A",
                    }
                  }}
                >
                  Download Quote
                </Button>
              </Box>
            </Card>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
