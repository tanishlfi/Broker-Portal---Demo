"use client";

import { useState } from "react";
import { CheckCircle, Download } from "lucide-react";

interface QuoteDocumentPageProps {
  leadReference: string;
  companyName?: string;
  validUntilDays?: number;
  onBack: () => void;
  onEmployerAccepted?: () => void;
}

export default function QuoteDocumentPage({
  leadReference,
  companyName,
  validUntilDays = 30,
  onBack,
  onEmployerAccepted,
}: QuoteDocumentPageProps) {
  const [downloading, setDownloading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + validUntilDays);
  const formattedDate = validUntilDate.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Generate a reference number similar to the screenshot: DOC-LD-1001-<timestamp>
  const docReference = `DOC-${leadReference}-${Date.now()}`;

  const handleDownload = () => {
    setDownloading(true);
    // Simulate download delay
    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  const handleEmployerAccepted = () => {
    setAccepted(true);
    onEmployerAccepted?.();
  };

  const btnOutline: React.CSSProperties = {
    height: "40px",
    padding: "0 20px",
    fontSize: "1rem",
    fontWeight: 500,
    background: "transparent",
    border: "1px solid #4a4a4a",
    color: "#ffffff",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  return (
    <div style={{ width: "100%", maxWidth: "896px" }}>

      {/* Main card */}
      <div style={{
        background: "#2d2d2d",
        border: "1px solid #4a4a4a",
        borderRadius: "8px",
        padding: "24px",
      }}>

        {/* Title */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", marginBottom: "8px" }}>
          Quote Document
        </h2>

        {/* Validity subtitle */}
        <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "24px" }}>
          This quote is valid for {validUntilDays} days. It will expire on {formattedDate}.
        </p>

        {/* Success banner */}
        <div style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}>
          <CheckCircle size={18} style={{ color: "#22c55e", flexShrink: 0, marginTop: "1px" }} />
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#22c55e", margin: 0 }}>
              Document generated successfully
            </p>
            <p style={{ fontSize: "13px", color: "#16a34a", margin: "4px 0 0 0" }}>
              Reference: {docReference}
            </p>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            width: "100%",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "0.9375rem",
            fontWeight: 500,
            background: "transparent",
            border: "1px solid #4a4a4a",
            color: "#ffffff",
            borderRadius: "6px",
            cursor: downloading ? "not-allowed" : "pointer",
            opacity: downloading ? 0.7 : 1,
            transition: "background 0.15s",
            marginBottom: "12px",
          }}
          onMouseEnter={e => {
            if (!downloading) (e.currentTarget as HTMLElement).style.background = "#3a3a3a";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Download size={16} />
          {downloading ? "Downloading..." : "Download Quote Document"}
        </button>

        {/* Employer Accepted Quote button */}
        <button
          onClick={handleEmployerAccepted}
          disabled={accepted}
          style={{
            width: "100%",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "0.9375rem",
            fontWeight: 500,
            background: accepted ? "rgba(31,195,235,0.7)" : "#1FC3EB",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: accepted ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => {
            if (!accepted) (e.currentTarget as HTMLElement).style.opacity = "0.9";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          <CheckCircle size={16} />
          {accepted ? "Quote Accepted" : "Employer Accepted Quote"}
        </button>
      </div>

      {/* Back button outside card */}
      <div style={{ marginTop: "16px" }}>
        <button
          onClick={onBack}
          style={btnOutline}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#4a4a4a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
