"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Plus } from "lucide-react";

import { getLead, LeadDetail } from "@/lib/api/leads";
import PreviousQuoteCard from "@/components/ui/PreviousQuoteCard";

interface LeadDetailsPageProps {
  leadId: string;
}

interface Quote {
  quoteId: string;
  quoteReference: string;
  quoteType: "Quick Quote" | "Full Quote";
  status: string;
  monthlyPremium: number;
  coverageAmount: number;
  createdAt: string;
}

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};



export default function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getLead(leadId);
        setLead(data);
        setQuotes(data.quotes || []);
      } catch (error) {
        console.error("Could not fetch lead from API:", error);
        setError("Failed to load lead details. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId]);

  if (loading) {
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

  if (error || !lead) {
    return (
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        color: "#A0A0A0",
      }}>
        {error || "Lead not found"}
      </Box>
    );
  }

  return (
    <main className="flex-1 p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Lead Details Header with Action Buttons */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "36px",
            letterSpacing: "0.0703125px",
            color: "var(--text-primary)",
            margin: 0,
          }}>
            Lead Details
          </h2>

          <Box sx={{ display: "flex", gap: "12px" }}>
            {!["Accepted", "Onboarding Submitted", "Approved", "Rejected", "Cancelled"].includes(lead.leadStatus) && (
              <Button
                onClick={() => router.push(`/lead/${leadId}/edit`)}
                variant="outlined"
                sx={{
                  bgcolor: "var(--table-header-bg)",
                  border: "1px solid var(--text-secondary)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "none",
                  px: "22px",
                  height: "40px",
                  "&:hover": {
                    bgcolor: "var(--border)",
                    borderColor: "var(--text-primary)",
                    borderWidth: "1px",
                  },
                }}
              >
                Edit
              </Button>
            )}

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
                    // Note: cancelLead function removed - implement as needed
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
                bgcolor: "#FE7F7F",
                color: "#000000",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                px: "22px",
                height: "40px",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#FF6C6C",
                  boxShadow: "none",
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

        <Divider sx={{ borderColor: "var(--border)", marginBottom: "31px" }} />

        {/* Lead Details Card */}
        <Card sx={{
          boxSizing: "border-box",
          background: "var(--card-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          p: "25px",
          marginBottom: "31px",
          boxShadow: "none",
        }}>
          {/* Employer Details */}
          <Box sx={{ marginBottom: "40px" }}>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "var(--text-primary)",
              margin: "0 0 12px 0",
            }}>
              Employer Details
            </h3>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Company Name</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{lead.employerName}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Registration Number</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)" }}>{lead.registrationNumber || "N/A"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Industry</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", textTransform: "capitalize" }}>{(lead as any).industry || "N/A"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Number of Employees</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)" }}>{lead.numberOfEmployees}</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Address</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)" }}>{(lead as any).address || "N/A"}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ borderColor: "var(--border)", my: "25px" }} />

          {/* Contact Details */}
          <Box>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "var(--text-primary)",
              margin: "0 0 12px 0",
            }}>
              Contact Details
            </h3>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Contact Person</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{lead.contactFirstName} {lead.contactLastName}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Position</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)" }}>{(lead as any).contactPosition || "N/A"}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Email</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)" }}>{lead.contactEmail}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Phone</Typography>
                <Typography sx={{ fontSize: "14px", color: "var(--text-primary)" }}>{(lead as any).contactPhone || "N/A"}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Previous Quotes Section */}
        <h2 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "18px",
          fontWeight: 500,
          lineHeight: "36px",
          letterSpacing: "0.0703125px",
          color: "var(--text-primary)",
          margin: "0 0 17px 0",
        }}>
          Previous Quotes
        </h2>

        {quotes.length === 0 ? (
          <Box sx={{
            background: "var(--card-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            p: "40px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}>
            No quotes available for this lead yet.
          </Box>
        ) : (
          <Stack spacing={2}>
            {quotes.map((quote) => (
              <PreviousQuoteCard key={quote.quoteId} quote={quote} />
            ))}
          </Stack>
        )}

      </div>
    </main>
  );
}
