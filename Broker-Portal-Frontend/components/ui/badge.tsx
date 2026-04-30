import * as React from "react";

// Base shared by all badges — overridden per-badge where needed
const BASE: React.CSSProperties = {
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  flexShrink:     0,
  fontSize:       "12px",
  fontWeight:     500,
  whiteSpace:     "nowrap",
  overflow:       "hidden",
  width:          "fit-content",
  transition:     "color 0.15s, box-shadow 0.15s",
};

// ── Lead Status ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  "Draft": {
    borderRadius:    "9999px",
    padding:         "3px 12px",
    background:      "#3a3a3a",
    color:           "#d1d5db",
    border:          "none",
  },
  "In Progress": {
    borderRadius:    "9999px",
    padding:         "3px 12px",
    background:      "rgb(31, 195, 235)",
    color:           "rgb(255, 255, 255)",
    border:          "none",
  },
  "Completed": {
    borderRadius:    "9999px",
    padding:         "3px 12px",
    background:      "transparent",
    color:           "#d1d5db",
    border:          "0.667px solid #4b5563",
  },
  "Cancelled": {
    borderRadius:    "9999px",
    padding:         "3px 12px",
    background:      "oklab(0.636841 0.187884 0.0889429 / 0.6)",
    color:           "rgb(255, 255, 255)",
    border:          "none",
  },
  "Quote Expired": {
    borderRadius:    "9999px",
    padding:         "3px 12px",
    background:      "rgb(31, 195, 235)",
    color:           "rgb(255, 255, 255)",
    border:          "none",
  },
};

// ── Quote Status — exact computed values from browser DevTools ───────────────

const QUOTE_STYLE: Record<string, React.CSSProperties> = {
  // border-radius: 9999px | border: rgb(59,130,246) | color: rgb(96,165,250) | bg: transparent
  "Quick Quote": {
    borderRadius:    "9999px",
    padding:         "3px 12px",
    background:      "transparent",
    color:           "rgb(96, 165, 250)",
    border:          "0.667px solid rgb(59, 130, 246)",
  },
  // border-radius: 8px | bg: oklab(0.696 -0.162114 0.0511765 / 0.1) | border: /0.2 | color: oklch(0.696 0.17 162.48)
  "Accepted": {
    borderRadius:    "8px",
    padding:         "2px 8px",
    background:      "oklab(0.696 -0.162114 0.0511765 / 0.1)",
    color:           "oklch(0.696 0.17 162.48)",
    border:          "0.667px solid oklab(0.696 -0.162114 0.0511766 / 0.2)",
  },
  "Approved": {
    borderRadius:    "8px",
    padding:         "2px 8px",
    background:      "oklab(0.696 -0.162114 0.0511765 / 0.1)",
    color:           "oklch(0.696 0.17 162.48)",
    border:          "0.667px solid oklab(0.696 -0.162114 0.0511766 / 0.2)",
  },
  // border-radius: 8px | bg: oklab(0.637 0.214213 0.1014 / 0.1) | border: /0.2 | color: oklch(0.637 0.237 25.331)
  "Rejected": {
    borderRadius:    "8px",
    padding:         "2px 8px",
    background:      "oklab(0.637 0.214213 0.1014 / 0.1)",
    color:           "oklch(0.637 0.237 25.331)",
    border:          "0.667px solid oklab(0.637 0.214213 0.1014 / 0.2)",
  },
  // Pending Approval — amber, same 8px radius pattern
  "Pending Approval": {
    borderRadius:    "8px",
    padding:         "2px 8px",
    background:      "oklab(0.795 0.0388 0.1 / 0.1)",
    color:           "oklch(0.795 0.184 86.047)",
    border:          "0.667px solid oklab(0.795 0.0388 0.1 / 0.2)",
  },
  // Full Quote — green, same 8px radius pattern
  "Full Quote": {
    borderRadius:    "8px",
    padding:         "2px 8px",
    background:      "oklab(0.723 -0.2 0.1 / 0.1)",
    color:           "oklch(0.723 0.219 149.579)",
    border:          "0.667px solid oklab(0.723 -0.2 0.1 / 0.2)",
  },
};

interface BadgeProps {
  label?: string;
  type: "status" | "quote";
}

export function Badge({ label, type }: BadgeProps) {
  if (!label) return <span style={{ fontSize: "12px", color: "#6b7280" }}>—</span>;

  const map   = type === "status" ? STATUS_STYLE : QUOTE_STYLE;
  const extra = map[label] ?? {
    borderRadius: "8px",
    padding:      "2px 8px",
    background:   "#3a3a3a",
    color:        "#d1d5db",
    border:       "none",
  };

  return <span style={{ ...BASE, ...extra }}>{label}</span>;
}
