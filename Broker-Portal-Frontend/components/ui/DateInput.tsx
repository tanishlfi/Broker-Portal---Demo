"use client";

import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import { useThemeToggle } from "@/app/providers";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  inputStyle?: React.CSSProperties;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLInputElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLInputElement>;
}

export default function DateInput({
  value,
  onChange,
  inputStyle,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}: DateInputProps) {
  const { isDarkMode } = useThemeToggle();
  const inputRef = useRef<HTMLInputElement>(null);

  const iconColor = isDarkMode ? "#ffffff" : "#475569";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Scoped style to hide the native calendar icon for THIS input only */}
      <style>{`
        .custom-date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 32px;
          height: 100%;
          position: absolute;
          right: 0;
          top: 0;
          cursor: pointer;
        }
      `}</style>

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="custom-date-input"
        style={{
          ...inputStyle,
          width: "100%",
          paddingRight: "40px",
          colorScheme: isDarkMode ? "dark" : "light",
        }}
      />

      {/* Visible calendar icon — clicking triggers the native picker */}
      <span
        onClick={() => inputRef.current?.showPicker?.()}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none", // native transparent indicator sits on top and handles the click
          display: "flex",
          alignItems: "center",
          color: iconColor,
          zIndex: 0,
        }}
      >
        <Calendar size={17} strokeWidth={2} />
      </span>
    </div>
  );
}
