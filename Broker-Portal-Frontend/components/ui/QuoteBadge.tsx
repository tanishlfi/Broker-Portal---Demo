import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
export default function QuoteBadge({ type, status }: { type: string; status?: string }) {
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