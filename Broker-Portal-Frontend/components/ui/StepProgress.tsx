"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  variant?: "segmented" | "continuous";
}

export default function StepProgress({ steps, currentStep, variant = "segmented" }: StepProgressProps) {
  const total = Math.max(steps.length, 1);
  const clampedStep = Math.min(Math.max(currentStep, 0), total - 1);

  return (
    <Box sx={{ mb: "24px" }}>
      {variant === "continuous" ? (
        <>
          {/* Separate pill bars (per-step), like the mock */}
          <Box
            sx={{
              display: "flex",
              gap: "14px",
              p: "10px",
            }}
          >
            {steps.map((_, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: "8px",
                  borderRadius: "12px",
                  bgcolor: i <= clampedStep ? "#00C0E8" : "#2A3340",
                  transition: "background-color 200ms ease",
                }}
              />
            ))}
          </Box>

          {/* Step labels under each pill */}
          <Box sx={{ display: "flex", gap: "14px", px: "10px" }}>
            {steps.map((label, i) => (
              <Box key={label} sx={{ flex: 1 }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "13px",
                    color: i === clampedStep ? "#00C0E8" : "#6b7280",
                    fontWeight: i === clampedStep ? 500 : 400,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <>
          {/* Segmented progress bars */}
          <Box sx={{ display: "flex", gap: "6px", mb: "8px" }}>
            {steps.map((_, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: "3px",
                  borderRadius: "2px",
                  bgcolor: i <= clampedStep ? "#1FC3EB" : "#2a2a2a",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </Box>
          {/* Step labels */}
          <Box sx={{ display: "flex", gap: "6px" }}>
            {steps.map((label, i) => (
              <Box key={i} sx={{ flex: 1 }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.75rem",
                    color: i === clampedStep ? "#1FC3EB" : "#6b7280",
                    fontWeight: i === clampedStep ? 500 : 400,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
