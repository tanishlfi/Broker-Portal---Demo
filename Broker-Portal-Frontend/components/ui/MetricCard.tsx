
import React from "react";
import { Box, Card, Typography } from "@mui/material";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export default function MetricCard({ value, label, icon: Icon }: MetricCardProps) {
  return (
    <Card
      sx={{
        p: "16px",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        background: "var(--card-secondary)",
        boxShadow: "none",
        height: "100%",
      }}
    >
      <Box
        sx={{
          mb: "4px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1,
            color: "var(--text-primary)",
          }}
        >
          {value}
        </Typography>
        {Icon && ( <Icon size={16} style={{ color: "var(--text-secondary)" }} />)}
       
      </Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </Typography>
    </Card>
  );
}

