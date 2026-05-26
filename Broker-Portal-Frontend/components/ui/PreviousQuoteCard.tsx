
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import QuoteBadge from "./QuoteBadge";

interface Quote {
  quoteId: string;
  quoteReference: string;
  quoteType: "Quick Quote" | "Full Quote";
  status: string;
  monthlyPremium: number;
  coverageAmount: number;
  createdAt: string;
}

interface QuoteCardProps {
  quote: Quote;
}

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

export default function PreviousQuoteCard({ quote }: QuoteCardProps) {
  return (
    <Card
      key={quote.quoteId}
      sx={{
        boxSizing: "border-box",
        background: "var(--card-secondary)",
        border: "0.625px solid var(--border)",
        borderRadius: "10px",
        p: "25px",
        boxShadow: "none",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          {/* Quote Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <QuoteBadge type={quote.quoteType} status={quote.status} />
          </Box>

          {/* Quote Details Grid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Quote ID</Typography>
              <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{quote.quoteReference}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Monthly Premium</Typography>
              <Typography sx={{ fontSize: "14px", color: "#1FC3EB", fontWeight: 500 }}>R {quote.monthlyPremium.toLocaleString()}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Coverage Amount</Typography>
              <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>R {quote.coverageAmount.toLocaleString()}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", mb: "4px" }}>Created Date</Typography>
              <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{fmt(quote.createdAt)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Card>
  );
}

