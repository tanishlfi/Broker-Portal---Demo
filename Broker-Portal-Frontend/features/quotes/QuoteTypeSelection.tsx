"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bolt, List } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import DashboardCard from "@/components/ui/DashboardCard";

function QuoteTypeSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const leadId = searchParams.get("leadId") || "";
  const companyName = searchParams.get("company") || "";
  const ref = searchParams.get("ref") || "";

  const handleQuickQuote = () => {
    router.push(`/lead/${leadId}/quote?ref=${ref}&company=${encodeURIComponent(companyName)}&type=quick`);
  };

  const handleFullQuote = () => {
    router.push(`/lead/${leadId}/quote?ref=${ref}&company=${encodeURIComponent(companyName)}&type=full`);
  };

  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        flex: 1,
        overflow: "hidden",
        p: "20px",
        bgcolor: "var(--background)",
      }}
    >
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

      <Box component="section" sx={{ position: "relative", mx: "auto", maxWidth: "1280px" }}>
        <Box sx={{ px: "4px", py: "16px" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "31px",
              fontWeight: 500,
              lineHeight: 1.25,
              color: "#FFFFFF",
            }}
          >
            Quote Generation
          </Typography>
        </Box>

        <Box sx={{ pt: "12px" }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: "16px 0px", mb: "16px" }}>
            <DashboardCard
              title="Quick Cost Estimate"
              description="Simple and Fast! In 30 sec or less"
              icon={<Bolt size={15} />}
              onClick={handleQuickQuote}
              style={{
                background: "linear-gradient(180deg, rgba(48,48,48,0.8) 0%, rgba(42,42,42,0.75) 100%)",
                borderColor: "#30363d",
                width: "271px",
                height: "225px",
                minHeight: "225px",
                borderRadius: "16px",
              }}
              iconWrapperStyle={{
                display: "inline-flex",
                height: "36px",
                width: "36px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                backgroundColor: "rgba(148,163,184,0.14)",
                color: "#d1d5db",
                marginBottom: "36px",
              }}
              titleStyle={{ fontSize: "22px", fontWeight: 500, lineHeight: "24px", color: "#f5f5f5" }}
              descriptionStyle={{ fontSize: "12px", color: "#8f96a3", lineHeight: "18px" }}
            />

            <DashboardCard
              title="Full Quote"
              description="Complete pricing using real names, the income, birthdate, and salary of each employee."
              icon={<List size={15} />}
              onClick={handleFullQuote}
              style={{
                background: "linear-gradient(180deg, rgba(48,48,48,0.8) 0%, rgba(42,42,42,0.75) 100%)",
                borderColor: "#30363d",
                width: "271px",
                height: "225px",
                minHeight: "225px",
                borderRadius: "16px",
              }}
              iconWrapperStyle={{
                display: "inline-flex",
                height: "36px",
                width: "36px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                backgroundColor: "rgba(148,163,184,0.14)",
                color: "#d1d5db",
                marginBottom: "24px",
              }}
              titleStyle={{ fontSize: "22px", fontWeight: 500, lineHeight: "24px", color: "#f5f5f5" }}
              descriptionStyle={{ fontSize: "12px", color: "#8f96a3", lineHeight: "18px" }}
            />
          </Stack>

          <Box
            component="ul"
            sx={{
              mt: "16px",
              pl: "20px",
              color: "#8f96a3",
              fontSize: "12px",
              lineHeight: "20px",
            }}
          >
            <Box component="li">18 to 64 years old.</Box>
            <Box component="li">Permanently employed or on 6+ month contract.</Box>
            <Box component="li">Legally employed & actively working 20+ hours a week in SA.</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function QuoteTypeSelection() {
  return (
    <Suspense fallback={<Box sx={{ px: "24px", pt: "24px", color: "#FFFFFF" }}>Loading...</Box>}>
      <QuoteTypeSelectionContent />
    </Suspense>
  );
}
