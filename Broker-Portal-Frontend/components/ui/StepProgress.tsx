"use client";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  variant?: "segmented" | "continuous";
}

export default function StepProgress({ steps, currentStep, variant = "segmented" }: StepProgressProps) {
  const total = Math.max(steps.length, 1);
  const clampedStep = Math.min(Math.max(currentStep, 0), total - 1);

  return (
    <div style={{ marginBottom: "24px" }}>
      {variant === "continuous" ? (
        <>
          {/* Separate pill bars (per-step), like the mock */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              padding: "10px",
            }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "8px",
                  borderRadius: "12px",
                  opacity: 1,
                  background: i <= clampedStep ? "#00C0E8" : "#2A3340",
                  transition: "background 200ms ease",
                }}
              />
            ))}
          </div>

          {/* Step labels under each pill */}
          <div style={{ display: "flex", gap: "14px", padding: "0 10px" }}>
            {steps.map((label, i) => (
              <div key={label} style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: i === clampedStep ? "#00C0E8" : "#6b7280",
                    fontWeight: i === clampedStep ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Segmented progress bars */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "3px",
                  borderRadius: "2px",
                  background: i <= clampedStep ? "#1FC3EB" : "#2a2a2a",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
          {/* Step labels */}
          <div style={{ display: "flex", gap: "6px" }}>
            {steps.map((label, i) => (
              <div key={i} style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: i === clampedStep ? "#1FC3EB" : "#6b7280",
                    fontWeight: i === clampedStep ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
