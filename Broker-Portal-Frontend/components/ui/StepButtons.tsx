"use client";

import React from "react";
import Button from "@mui/material/Button";

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
    <Button
      onClick={onClick}
      sx={{
        width: "78px",
        height: "33px",
        borderRadius: "100px",
        border: "1px solid #333333",
        bgcolor: "transparent",
        color: "#d1d5db",
        fontSize: "0.875rem",
        fontWeight: 400,
        textTransform: "none",
        p: 0,
        minWidth: "auto",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#9ca3af",
          color: "#ffffff",
          bgcolor: "transparent",
        },
      }}
    >
      {label}
    </Button>
  );
}

interface SaveDraftButtonProps {
  onClick: () => void;
  label?: string;
}

export function SaveDraftButton({ onClick, label = "Save Draft" }: SaveDraftButtonProps) {
  return (
    <Button
      onClick={onClick}
      sx={{
        width: "115px",
        height: "33px",
        borderRadius: "100px",
        border: "1px solid #333333",
        bgcolor: "transparent",
        color: "#d1d5db",
        fontSize: "0.875rem",
        fontWeight: 400,
        textTransform: "none",
        p: "8px 22px",
        minWidth: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "#9ca3af",
          color: "#ffffff",
          bgcolor: "transparent",
        },
      }}
    >
      {label}
    </Button>
  );
}

interface SaveLeadButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

interface ProceedButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function SaveLeadButton({ onClick, label = "Save Lead Details", disabled = false }: SaveLeadButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: "36px",
        px: "20px",
        borderRadius: "8px",
        bgcolor: "transparent",
        border: "1px solid #C4CDD8",
        color: "#C4CDD8",
        fontSize: "0.875rem",
        fontWeight: 500,
        textTransform: "none",
        whiteSpace: "nowrap",
        transition: "all 0.15s ease",
        "&.Mui-disabled": {
          opacity: 0.6,
          color: "#C4CDD8",
          borderColor: "#C4CDD8",
        },
        "&:hover": {
          borderColor: "#ffffff",
          color: "#ffffff",
          bgcolor: "transparent",
        },
      }}
    >
      {label}
    </Button>
  );
}

export function ProceedButton({ onClick, label = "Proceed to Quote Generation", disabled = false }: ProceedButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: "36px",
        px: "20px",
        borderRadius: "8px",
        bgcolor: disabled ? "#2a7a8f" : "#1FC3EB",
        color: "#ffffff",
        fontSize: "0.875rem",
        fontWeight: 500,
        textTransform: "none",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s",
        "&.Mui-disabled": {
          opacity: 0.6,
          bgcolor: "#2a7a8f",
          color: "#ffffff",
        },
        "&:hover": {
          opacity: 0.85,
          bgcolor: disabled ? "#2a7a8f" : "#1FC3EB",
        },
      }}
    >
      {label}
    </Button>
  );
}

export function NextButton({ onClick, label = "Next Step", disabled = false }: NextButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: "36px",
        px: "20px",
        borderRadius: "8px",
        bgcolor: disabled ? "#2a7a8f" : "#1FC3EB",
        color: "#ffffff",
        fontSize: "0.875rem",
        fontWeight: 500,
        textTransform: "none",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s",
        "&.Mui-disabled": {
          opacity: 0.6,
          bgcolor: "#2a7a8f",
          color: "#ffffff",
        },
        "&:hover": {
          opacity: 0.85,
          bgcolor: disabled ? "#2a7a8f" : "#1FC3EB",
        },
      }}
    >
      {label}
    </Button>
  );
}
