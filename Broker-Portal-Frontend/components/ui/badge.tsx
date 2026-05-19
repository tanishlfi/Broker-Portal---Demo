import * as React from "react";
import Chip from "@mui/material/Chip";

// ── Lead Status styles ─────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, any> = {
  "Draft": {
    borderRadius: "9999px", px: "4px", py: "1px",
    bgcolor: "#3a3a3a", color: "#d1d5db", border: "none",
  },
  "In Progress": {
    borderRadius: "9999px", px: "4px", py: "1px",
    bgcolor: "rgb(31,195,235)", color: "#fff", border: "none",
  },
  "Active": {
    width: "53.22px", height: "21.23px",
    borderRadius: "8px", border: "0.63px solid #000",
    bgcolor: "#1FC3EB", color: "#000",
    fontSize: "11px", fontWeight: 500,
  },
  "Completed": {
    borderRadius: "9999px", px: "4px", py: "1px",
    bgcolor: "transparent", color: "#d1d5db",
    border: "0.667px solid #4b5563",
  },
  "Cancelled": {
    borderRadius: "9999px", px: "4px", py: "1px",
    bgcolor: "rgba(239, 68, 68, 0.6)",
    color: "#fff", border: "none",
  },
  "Quote Expired": {
    borderRadius: "9999px", px: "4px", py: "1px",
    bgcolor: "rgb(31,195,235)", color: "#fff", border: "none",
  },
};

// ── Quote Status styles ────────────────────────────────────────────────────────

const QUOTE_STYLE: Record<string, any> = {
  "Quick Quote": {
    borderRadius: "9999px", px: "4px", py: "1px",
    bgcolor: "transparent", color: "rgb(96,165,250)",
    border: "0.667px solid rgb(59,130,246)",
  },
  "Accepted": {
    borderRadius: "8px", px: "0px", py: "0px",
    bgcolor: "rgba(34, 197, 94, 0.1)",
    color: "rgb(34, 197, 94)",
    border: "0.667px solid rgba(34, 197, 94, 0.2)",
  },
  "Approved": {
    borderRadius: "8px", px: "0px", py: "0px",
    bgcolor: "rgba(34, 197, 94, 0.1)",
    color: "rgb(34, 197, 94)",
    border: "0.667px solid rgba(34, 197, 94, 0.2)",
  },
  "Rejected": {
    borderRadius: "8px", px: "0px", py: "0px",
    bgcolor: "rgba(239, 68, 68, 0.1)",
    color: "rgb(239, 68, 68)",
    border: "0.667px solid rgba(239, 68, 68, 0.2)",
  },
  "Pending Approval": {
    borderRadius: "8px", px: "0px", py: "0px",
    bgcolor: "rgba(245, 158, 11, 0.1)",
    color: "rgb(245, 158, 11)",
    border: "0.667px solid rgba(245, 158, 11, 0.2)",
  },
  "Full Quote": {
    borderRadius: "8px", px: "0px", py: "0px",
    bgcolor: "rgba(16, 185, 129, 0.1)",
    color: "rgb(16, 185, 129)",
    border: "0.667px solid rgba(16, 185, 129, 0.2)",
  },
};

// ── Payment Status styles ──────────────────────────────────────────────────────

const PAYMENT_STYLE: Record<string, any> = {
  "Paid": {
    borderRadius: "8px", border: "0.63px solid #00C950",
    bgcolor: "#00C9501A", color: "#00C950",
    fontSize: "11px", fontWeight: 500, height: "21.23px",
  },
  "Failed": {
    borderRadius: "8px", border: "0.63px solid #EF4444",
    bgcolor: "#EF444499", color: "#ffffff",
    fontSize: "11px", fontWeight: 500, height: "21.23px",
  },
  "Pending": {
    borderRadius: "8px", border: "0.63px solid #F0B100",
    bgcolor: "#F0B1001A", color: "#F0B100",
    fontSize: "11px", fontWeight: 500, height: "21.23px",
  },
};

// Inline SVG icons
const PAYMENT_ICON: Record<string, React.ReactNode> = {
  "Paid": (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" stroke="#00C950" strokeWidth="1"/>
      <polyline points="3.5,6 5,7.5 8.5,4" stroke="#00C950" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "Failed": (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" stroke="#ffffff" strokeWidth="1"/>
      <line x1="4" y1="4" x2="8" y2="8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="8" y1="4" x2="4" y2="8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  "Pending": (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" stroke="#F0B100" strokeWidth="1"/>
      <polyline points="6,3 6,6 7.5,7.5" stroke="#F0B100" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

interface BadgeProps {
  label?: string;
  type: "status" | "quote" | "payment";
}

export function Badge({ label, type }: BadgeProps) {
  if (!label) return <span style={{ fontSize: "12px", color: "#6b7280" }}>—</span>;

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    width: "fit-content",
    height: "auto",
    "& .MuiChip-label": {
      px: "10px",
      py: "2px",
    },
    "& .MuiChip-icon": {
      ml: "8px",
      mr: "-4px",
    }
  };

  if (type === "payment") {
    const style = PAYMENT_STYLE[label] ?? PAYMENT_STYLE["Pending"];
    return (
      <Chip
        label={label}
        icon={PAYMENT_ICON[label] as any}
        sx={{
          ...baseStyle,
          ...style,
        }}
      />
    );
  }

  const map = type === "status" ? STATUS_STYLE : QUOTE_STYLE;
  const extra = map[label] ?? {
    borderRadius: "8px",
    bgcolor: "#3a3a3a",
    color: "#d1d5db",
    border: "none",
  };

  return (
    <Chip
      label={label}
      sx={{
        ...baseStyle,
        ...extra,
      }}
    />
  );
}

export default Badge;
