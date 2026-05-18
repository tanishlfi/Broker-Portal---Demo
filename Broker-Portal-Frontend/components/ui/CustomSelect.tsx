"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ error, className = "", style, containerStyle, onFocus, onBlur, onMouseEnter, onMouseLeave, children, ...props }, ref) => {
    const internalRef = useRef<HTMLSelectElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Baseline custom dropdown styles
    const baseStyle: React.CSSProperties = {
      height: "40px",
      width: "100%",
      padding: "0 12px",
      background: "#2a2a2a",
      border: "1px solid #30363D",
      borderRadius: "6px",
      fontSize: "0.875rem",
      color: "#ffffff",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.15s, box-shadow 0.15s",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      paddingRight: "32px",
      cursor: "pointer",
      ...style,
    };

    // Apply interactive states
    if (error) {
      baseStyle.borderColor = "#ef4444";
    } else if (isFocused) {
      baseStyle.borderColor = "#1FC3EB";
      baseStyle.boxShadow = "0 0 0 3px rgba(31,195,235,0.15)";
    } else if (isHovered) {
      baseStyle.borderColor = "rgba(31,195,235,0.5)";
    }

    return (
      <div style={{ width: "100%", ...containerStyle }}>
        <select
          ref={internalRef}
          className={className}
          style={baseStyle}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onMouseEnter={(e) => {
            setIsHovered(true);
            onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            setIsHovered(false);
            onMouseLeave?.(e);
          }}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px", margin: "4px 0 0 0" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
export default CustomSelect;
