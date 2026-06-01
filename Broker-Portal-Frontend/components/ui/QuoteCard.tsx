"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { ChevronDown } from "lucide-react";
import QuoteBadge from "./QuoteBadge";

export interface Quote {
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

interface QuoteCardProps {
  quote: Quote;
  onOpenMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function QuoteCard({ quote, onOpenMenu }: QuoteCardProps) {
  return (
    <Card
      key={quote.id}
      sx={{
        boxSizing: "border-box",
        background: "var(--card-secondary)",
        border: "0.625px solid var(--border)",
        borderRadius: "10px",
        p: "25px",
        boxShadow: "none",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Left Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Company Name & Badges */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Typography variant="h3" sx={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)", m: 0 }}>
              {quote.companyName}
            </Typography>
            <QuoteBadge type={quote.quoteType} daysRemaining={quote.daysRemaining} />
          </Box>

          {/* Quote Details Grid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Quote ID</Typography>
              <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{quote.quoteId}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Monthly Premium</Typography>
              <Typography sx={{ fontSize: "14px", color: "#1FC3EB", fontWeight: 500 }}>{quote.monthlyPremium}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Coverage Amount</Typography>
              <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{quote.coverageAmount}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Created Date</Typography>
              <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{quote.createdDate}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Actions Button */}
        <Box>
          <Button
            variant="outlined"
            endIcon={<ChevronDown size={20} />}
            onClick={onOpenMenu}
            sx={{
              height: "36px",
              bgcolor: "var(--table-header-bg)",
              border: "1px solid var(--text-secondary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              textTransform: "none",
              outline: "none",
              "&:focus": {
                outline: "none",
              },
              "&.Mui-focusVisible": {
                outline: "none",
                borderColor: "var(--text-primary)",
              },
              "&:hover": {
                bgcolor: "var(--border)",
                borderColor: "var(--text-primary)",
                borderWidth: "1px",
              }
            }}
          >
            Actions
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
