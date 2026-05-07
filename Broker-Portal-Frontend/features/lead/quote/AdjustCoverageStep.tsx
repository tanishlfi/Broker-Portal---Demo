"use client";

import React, { useState } from "react";
import CoverSummary from "@/components/ui/CoverSummary";
import { BackButton, NextButton } from "@/components/ui/StepButtons";
import StepProgress from "@/components/ui/StepProgress";
import DownloadQuoteModal from "@/components/ui/DownloadQuoteModal";

const QUICK_STEPS = ["Quote Details", "Adjust Cover Amounts"];

interface CoverageData {
  lifeCover: number;
  funeralCover: number;
  occupationalDisability: number;
  totalCover: number;
  totalMonthlyPremium: number;
}

interface AdjustCoverageStepProps {
  onBack: () => void;
  onGenerateQuote: (coverageData: CoverageData) => void;
  onContinueToFull?: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 400,
  color: "#9ca3af",
  display: "block",
  marginBottom: "8px",
};

const coverageItemStyle: React.CSSProperties = {
  background: "#2a2a2a",
  border: "1px solid #30363D",
  borderRadius: "8px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const sliderStyle: React.CSSProperties = {
  width: "100%",
  height: "6px",
  borderRadius: "3px",
  background: "#30363D",
  outline: "none",
  WebkitAppearance: "none",
};

export default function AdjustCoverageStep({ onBack, onGenerateQuote, onContinueToFull }: AdjustCoverageStepProps) {
  const [lifeCover, setLifeCover] = useState(100000);
  const [funeralCover, setFuneralCover] = useState(10000);
  const [occupationalDisability, setOccupationalDisability] = useState(50000);
  const [showModal, setShowModal] = useState(false);

  const totalCover = lifeCover + funeralCover + occupationalDisability;
  const totalMonthlyPremium = Math.round(lifeCover * 0.0012 + funeralCover * 0.006 + occupationalDisability * 0.0008);

  const formatCurrency = (value: number) => `R ${value.toLocaleString("en-ZA")}`;

  return (
    <>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
        Quick Cost Estimate
      </h2>

      <StepProgress steps={QUICK_STEPS} currentStep={1} variant="continuous" />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        flex: 1,
      }}>
        
        {/* Left side - Adjust Cover Amounts */}
        <div style={{
          background: "#1E1E1E",
          border: "1px solid #30363D",
          borderRadius: "8px",
          padding: "20px",
          height: "fit-content",
        }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
            Adjust Cover Amounts
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginBottom: "24px" }}>
            For an average of <strong style={{ color: "#1FC3EB" }}>R25000</strong> per employee p/m, each now would get:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Life Cover */}
            <div style={coverageItemStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Life cover</label>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {formatCurrency(lifeCover)}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="10000"
                value={lifeCover}
                onChange={(e) => setLifeCover(Number(e.target.value))}
                style={sliderStyle}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
                <span>R0.00</span>
                <span>R 2,000,000.00</span>
              </div>
            </div>

            {/* Funeral Cover */}
            <div style={coverageItemStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Funeral Cover</label>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {formatCurrency(funeralCover)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={funeralCover}
                onChange={(e) => setFuneralCover(Number(e.target.value))}
                style={sliderStyle}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
                <span>R5,000</span>
                <span>R50,000</span>
              </div>
            </div>

            {/* Occupational Disability */}
            <div style={coverageItemStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Occupational Disability</label>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {formatCurrency(occupationalDisability)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={occupationalDisability}
                onChange={(e) => setOccupationalDisability(Number(e.target.value))}
                style={sliderStyle}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
                <span>R5,000</span>
                <span>R50,000</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right side - Cover Summary */}
        <div style={{ height: "fit-content" }}>
          <CoverSummary
            lifeCover={lifeCover}
            funeralCover={funeralCover}
            occupationalDisability={occupationalDisability}
            totalCover={totalCover}
            totalMonthlyPremium={totalMonthlyPremium}
          />
        </div>

      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <BackButton onClick={onBack} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {onContinueToFull && (
            <button
              onClick={onContinueToFull}
              style={{
                height: "36px", padding: "0 20px",
                borderRadius: "8px",
                border: "1px solid #ffffff",
                background: "transparent",
                color: "#ffffff",
                fontSize: "0.875rem", fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
                boxSizing: "border-box",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Continue to Full Quote
            </button>
          )}
          <NextButton label="Save & Generate Quote" onClick={() => setShowModal(true)} />
        </div>
      </div>

      {showModal && <DownloadQuoteModal onClose={() => setShowModal(false)} />}
    </>
  );
}
