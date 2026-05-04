import * as React from "react";

type Variant = "view" | "continue" | "destructive";
type Size    = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

// Shared base — from computed: display flex, align-items center, justify-content center,
// height 32px, font-size 14px, font-weight 500, border-radius 8px, gap 6px,
// padding 0 10px, transition all 0.15s cubic-bezier(0.4,0,0.2,1), white-space nowrap
const BASE: React.CSSProperties = {
  display:        "inline-flex",
  alignItems:     "center",
  justifyContent: "center",
  whiteSpace:     "nowrap",
  borderRadius:   "8px",
  fontSize:       "14px",
  fontWeight:     500,
  gap:            "6px",
  padding:        "0 10px",
  transition:     "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  outline:        "none",
  cursor:         "pointer",
  flexShrink:     0,
};

const SIZE: Record<Size, React.CSSProperties> = {
  sm: { height: "32px" },
  md: { height: "40px", padding: "0 16px" },
};

type VariantState = { normal: React.CSSProperties; hover: React.CSSProperties };

const VARIANTS: Record<Variant, VariantState> = {
  // View — plain text, no bg, no border
  view: {
    normal: {
      background: "transparent",
      color:      "rgb(156, 163, 175)",
      border:     "none",
    },
    hover: {
      background: "transparent",
      color:      "rgb(31, 195, 235)",
      border:     "none",
    },
  },

  // Continue — exact computed:
  // background: oklab(0.348457 0.0000158995 0.00000697374 / 0.3)
  // border: 0.667px solid rgb(58, 58, 58)
  // color: rgb(31, 195, 235)
  continue: {
    normal: {
      background: "oklab(0.348457 0.0000158995 0.00000697374 / 0.3)",
      border:     "0.667px solid rgb(58, 58, 58)",
      color:      "rgb(31, 195, 235)",
    },
    hover: {
      background: "oklab(0.348457 0.0000158995 0.00000697374 / 0.45)",
      border:     "0.667px solid rgb(58, 58, 58)",
      color:      "rgb(31, 195, 235)",
    },
  },

  // Cancel — exact computed:
  // background: oklab(0.636841 0.187884 0.0889429 / 0.6)
  // border: none (border-width: 0px)
  // color: rgb(255, 255, 255)
  destructive: {
    normal: {
      background: "oklab(0.636841 0.187884 0.0889429 / 0.6)",
      border:     "none",
      color:      "rgb(255, 255, 255)",
    },
    hover: {
      background: "oklab(0.636841 0.187884 0.0889429 / 0.8)",
      border:     "none",
      color:      "rgb(255, 255, 255)",
    },
  },
};

export function Button({
  variant   = "view",
  size      = "sm",
  className = "",
  style,
  onMouseEnter,
  onMouseLeave,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  const computed: React.CSSProperties = {
    ...BASE,
    ...SIZE[size],
    ...VARIANTS[variant].normal,
    ...(hovered && !disabled ? VARIANTS[variant].hover : {}),
    ...(disabled ? { opacity: 0.5, pointerEvents: "none" } : {}),
    ...style,
  };

  return (
    <button
      className={className}
      style={computed}
      disabled={disabled}
      onMouseEnter={(e) => { setHovered(true);  onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
      {...props}
    >
      {children}
    </button>
  );
}
