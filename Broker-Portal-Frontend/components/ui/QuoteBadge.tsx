import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
export default function QuoteBadge({ type, status, daysRemaining }: { type: string; status?: string, daysRemaining?: number }) {
  const typeStyles: Record<string, { bg: string; color: string, border: string }> = {
    "Quick Quote": { bg: "rgba(43,127,255,0.1)", color: "#2B7FFF", border: "1px solid rgba(43,127,255,0.2)" },
    "Full Quote": { bg: "rgba(31,195,235,0.1)", color: "var(--primary)", border: "1px solid rgba(31,195,235,0.2)" },
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
          height: "22px",
          bgcolor: typeStyle.bg,
          color: typeStyle.color,
          border: typeStyle.border,
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
      {daysRemaining && (
        <Chip
          label={`${daysRemaining} days remaining`}
          sx={{
            height: "22px",
            bgcolor: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontSize: "12px",
            fontWeight: 500,
            "& .MuiChip-label": { px: "8px" }
          }}
        />
      )}
    </Box>
  );
}