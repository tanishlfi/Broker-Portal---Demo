"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}

export default function FilterDropdown({
  value,
  onChange,
  options,
  placeholder,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayLabel =
    value === "All" ? placeholder : value;

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "38px",
          padding: "0 14px",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          background: "var(--input)",
          color: "var(--foreground)",
          fontSize: "13px",
          cursor: "pointer",
          minWidth: "160px",
          justifyContent: "space-between",
        }}
      >
        <span>{displayLabel}</span>

        <ChevronDown
          size={14}
          style={{
            opacity: 0.5,
            transform: open
              ? "rotate(180deg)"
              : "none",
            transition:
              "transform 0.15s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: "160px",
            background: "var(--card)",
            border:
              "1px solid var(--border)",
            borderRadius: "8px",
            zIndex: 50,
            maxHeight: "300px",
            overflow: "auto",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 14px",
                fontSize: "13px",
                color:
                  opt === value
                    ? "var(--primary)"
                    : "var(--foreground)",
                background:
                  opt === value
                    ? "rgba(31,195,235,0.08)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {opt === "All"
                ? placeholder
                : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}