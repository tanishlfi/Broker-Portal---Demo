"use client";

import { useState } from "react";

interface DownloadQuoteModalProps {
  onClose: () => void;
}

export default function DownloadQuoteModal({ onClose }: DownloadQuoteModalProps) {
  const [tradingName, setTradingName] = useState("");
  const [idNumber, setIdNumber] = useState("");

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1E1E1E",
          border: "0.63px solid #30363D",
          borderRadius: "10px",
          padding: "24.62px",
          width: "549px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff" }}>Download Quote</span>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Trading name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#d1d5db" }}>
            Trading name
          </label>
          <input
            type="text"
            placeholder="Enter Trading name"
            value={tradingName}
            onChange={e => setTradingName(e.target.value)}
            style={{
              width: "100%", height: "40px",
              background: "#2a2a2a", border: "1px solid #30363D",
              borderRadius: "6px", color: "#ffffff",
              fontSize: "0.875rem", padding: "0 12px",
              boxSizing: "border-box", outline: "none",
            }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1FC3EB"; }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "#30363D"; }}
          />
        </div>

        {/* ID / passport */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#d1d5db", display: "block", marginBottom: "4px" }}>
              ID or passport number
            </label>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
              Used as a password for opening documents containing employee details
            </p>
          </div>
          <input
            type="text"
            placeholder="Enter ID or passport number"
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            style={{
              width: "100%", height: "40px",
              background: "#2a2a2a", border: "1px solid #30363D",
              borderRadius: "6px", color: "#ffffff",
              fontSize: "0.875rem", padding: "0 12px",
              boxSizing: "border-box", outline: "none",
            }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1FC3EB"; }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "#30363D"; }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => { /* TODO: download employee schedule */ }}
            style={{
              flex: 1, height: "38px",
              background: "transparent", border: "1px solid #ffffff",
              color: "#ffffff", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Download Employee Schedule
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: "38px",
              background: "#1FC3EB", border: "none",
              color: "#ffffff", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Download Quote
          </button>
        </div>
      </div>
    </div>
  );
}
