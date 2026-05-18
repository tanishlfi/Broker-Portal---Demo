"use client";

import React from "react";

interface OptionItem {
  label: string;
  value: string;
}

interface OptionToggleGroupProps {
  options: (string | OptionItem)[];
  value: string;
  onChange: (val: string) => void;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  error?: string;
}

export function OptionToggleGroup({
  options,
  value,
  onChange,
  style,
  buttonStyle,
  error,
}: OptionToggleGroupProps) {
  const formattedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", ...style }}>
        {formattedOptions.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={{
                height: "36px",
                padding: "0 20px",
                borderRadius: "6px",
                border: `1px solid ${active ? "#1FC3EB" : error ? "#ef4444" : "#30363D"}`,
                background: active ? "rgba(31,195,235,0.15)" : "#2a2a2a",
                color: active ? "#1FC3EB" : "#9ca3af",
                fontSize: "0.875rem",
                fontWeight: active ? 500 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                boxSizing: "border-box",
                ...buttonStyle,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(31,195,235,0.5)";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = error ? "#ef4444" : "#30363D";
                  e.currentTarget.style.color = "#9ca3af";
                }
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px", margin: "4px 0 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default OptionToggleGroup;
