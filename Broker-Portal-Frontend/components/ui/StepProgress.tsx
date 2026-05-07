"use client";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Progress bars */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background: i <= currentStep ? "#1FC3EB" : "#2a2a2a",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      {/* Step labels */}
      <div style={{ display: "flex", gap: "6px" }}>
        {steps.map((label, i) => (
          <div key={i} style={{ flex: 1 }}>
            <span style={{
              fontSize: "0.75rem",
              color: i === currentStep ? "#1FC3EB" : "#6b7280",
              fontWeight: i === currentStep ? 500 : 400,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
