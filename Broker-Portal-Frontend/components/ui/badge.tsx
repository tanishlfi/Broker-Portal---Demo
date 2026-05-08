import * as React from "react";

// ── Base ──────────────────────────────────────────────────────────────────────

const BASE: React.CSSProperties = {
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  flexShrink:     0,
  fontSize:       "12px",
  fontWeight:     500,
  whiteSpace:     "nowrap",
  width:          "fit-content",
  transition:     "color 0.15s, box-shadow 0.15s",
};

// ── Lead Status ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  "Draft": {
    borderRadius: "9999px", padding: "3px 12px",
    background: "#3a3a3a", color: "#d1d5db", border: "none",
  },
  "In Progress": {
    borderRadius: "9999px", padding: "3px 12px",
    background: "rgb(31,195,235)", color: "#fff", border: "none",
  },
  "Active": {
    width: "53.22px", height: "21.23px",
    borderRadius: "8px", border: "0.63px solid #000",
    background: "#1FC3EB", color: "#000",
    fontSize: "11px", fontWeight: 500, padding: "0 8px",
  },
  "Completed": {
    borderRadius: "9999px", padding: "3px 12px",
    background: "transparent", color: "#d1d5db",
    border: "0.667px solid #4b5563",
  },
  "Cancelled": {
    borderRadius: "9999px", padding: "3px 12px",
    background: "oklab(0.636841 0.187884 0.0889429 / 0.6)",
    color: "#fff", border: "none",
  },
  "Quote Expired": {
    borderRadius: "9999px", padding: "3px 12px",
    background: "rgb(31,195,235)", color: "#fff", border: "none",
  },
};

// ── Quote Status ──────────────────────────────────────────────────────────────

const QUOTE_STYLE: Record<string, React.CSSProperties> = {
  "Quick Quote": {
    borderRadius: "9999px", padding: "3px 12px",
    background: "transparent", color: "rgb(96,165,250)",
    border: "0.667px solid rgb(59,130,246)",
  },
  "Accepted": {
    borderRadius: "8px", padding: "2px 8px",
    background: "oklab(0.696 -0.162114 0.0511765 / 0.1)",
    color: "oklch(0.696 0.17 162.48)",
    border: "0.667px solid oklab(0.696 -0.162114 0.0511766 / 0.2)",
  },
  "Approved": {
    borderRadius: "8px", padding: "2px 8px",
    background: "oklab(0.696 -0.162114 0.0511765 / 0.1)",
    color: "oklch(0.696 0.17 162.48)",
    border: "0.667px solid oklab(0.696 -0.162114 0.0511766 / 0.2)",
  },
  "Rejected": {
    borderRadius: "8px", padding: "2px 8px",
    background: "oklab(0.637 0.214213 0.1014 / 0.1)",
    color: "oklch(0.637 0.237 25.331)",
    border: "0.667px solid oklab(0.637 0.214213 0.1014 / 0.2)",
  },
  "Pending Approval": {
    borderRadius: "8px", padding: "2px 8px",
    background: "oklab(0.795 0.0388 0.1 / 0.1)",
    color: "oklch(0.795 0.184 86.047)",
    border: "0.667px solid oklab(0.795 0.0388 0.1 / 0.2)",
  },
  "Full Quote": {
    borderRadius: "8px", padding: "2px 8px",
    background: "oklab(0.723 -0.2 0.1 / 0.1)",
    color: "oklch(0.723 0.219 149.579)",
    border: "0.667px solid oklab(0.723 -0.2 0.1 / 0.2)",
  },
};

// ── Payment Status ────────────────────────────────────────────────────────────

const PAYMENT_STYLE: Record<string, React.CSSProperties> = {
  "Paid": {
    width: "58.19px", height: "21.23px",
    borderRadius: "8px", border: "0.63px solid #00C950",
    background: "#00C9501A", color: "#00C950",
    fontSize: "11px", fontWeight: 500, gap: "4px",
  },
  "Failed": {
    width: "67.42px", height: "21.23px",
    borderRadius: "8px", border: "0.63px solid #EF4444",
    background: "#EF444499", color: "#ffffff",
    fontSize: "11px", fontWeight: 500, gap: "4px",
  },
  "Pending": {
    width: "80.26px", height: "21.23px",
    borderRadius: "8px", border: "0.63px solid #F0B100",
    background: "#F0B1001A", color: "#F0B100",
    fontSize: "11px", fontWeight: 500, gap: "4px",
  },
};

// Inline SVG icons — no images, no external libs
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

// ── Badge component ───────────────────────────────────────────────────────────

interface BadgeProps {
  label?: string;
  type: "status" | "quote" | "payment";
}

export function Badge({ label, type }: BadgeProps) {
  if (!label) return <span style={{ fontSize: "12px", color: "#6b7280" }}>—</span>;

  if (type === "payment") {
    const style = PAYMENT_STYLE[label] ?? PAYMENT_STYLE["Pending"];
    return (
      <span style={{ ...BASE, ...style }}>
        {PAYMENT_ICON[label]}
        {label}
      </span>
    );
  }

  const map = type === "status" ? STATUS_STYLE : QUOTE_STYLE;
  const extra = map[label] ?? {
    borderRadius: "8px", padding: "2px 8px",
    background: "#3a3a3a", color: "#d1d5db", border: "none",
  };

  return <span style={{ ...BASE, ...extra }}>{label}</span>;
}
