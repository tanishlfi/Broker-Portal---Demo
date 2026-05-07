"use client";

import React from "react";

export const formInputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  height: "44px",
  padding: "0 12px",
  background: "#262626",
  border: `1px solid ${hasError ? "var(--destructive)" : "#2A3340"}`,
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
});

export const formSelectStyle = (hasError: boolean): React.CSSProperties => ({
  ...formInputStyle(hasError),
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235E6A77' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "36px",
});

export const formLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "#C4CDD8",
  marginBottom: "6px",
};

export const formErrorStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--destructive)",
  marginTop: "4px",
};

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function FormField({ label, error, children, style }: FormFieldProps) {
  return (
    <div style={style}>
      <label style={formLabelStyle}>{label}</label>
      {children}
      {error && <p style={formErrorStyle}>{error}</p>}
    </div>
  );
}
