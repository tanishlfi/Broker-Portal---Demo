"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ error, className = "", style, containerStyle, onFocus, onBlur, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Baseline dark theme styling
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
        <input
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
        />
        {error && (
          <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px", margin: "4px 0 0 0" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
export default CustomInput;
