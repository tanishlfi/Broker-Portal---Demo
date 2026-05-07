"use client";

import React from "react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

interface NextButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function BackButton({ onClick, label = "Back" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "78px",
        height: "33px",
        borderRadius: "100px",
        border: "1px solid #333333",
        background: "transparent",
        color: "#d1d5db",
        fontSize: "0.875rem",
        fontWeight: 400,
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "#9ca3af";
        (e.currentTarget as HTMLElement).style.color = "#ffffff";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "#333333";
        (e.currentTarget as HTMLElement).style.color = "#d1d5db";
      }}
    >
      {label}
    </button>
  );
}

export function NextButton({ onClick, label = "Next Step", disabled = false }: NextButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: "36px",
        padding: "0 20px",
        borderRadius: "8px",
        background: disabled ? "#2a7a8f" : "#1FC3EB",
        border: "none",
        color: "#ffffff",
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLElement).style.opacity = "0.85";
      }}
      onMouseLeave={e => {
        if (!disabled) (e.currentTarget as HTMLElement).style.opacity = "1";
      }}
    >
      {label}
    </button>
  );
}
