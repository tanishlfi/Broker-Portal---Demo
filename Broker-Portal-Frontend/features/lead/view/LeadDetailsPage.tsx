"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { getLeads, Lead } from "@/lib/api/leads";
import { getValidToken } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

interface LeadDetailsPageProps {
  leadId: string;
}

interface Quote {
  quoteId: string;
  quoteReference: string;
  companyName: string;
  quoteType: "Quick Quote" | "Full Quote";
  status: string;
  monthlyPremium: number;
  coverageAmount: number;
  createdAt: string;
}

// Mock quotes data
const MOCK_QUOTES: Quote[] = [
  {
    quoteId: "Q-LEAD-1744147200000-847",
    quoteReference: "Q-LEAD-1744147200000-847",
    companyName: "Tech Innovations Pty Ltd",
    quoteType: "Quick Quote",
    status: "Expired",
    monthlyPremium: 26629,
    coverageAmount: 395666,
    createdAt: "2026-05-04",
  },
  {
    quoteId: "Q-LEAD-1744147200000-848",
    quoteReference: "Q-LEAD-1744147200000-848",
    companyName: "Tech Innovations Pty Ltd",
    quoteType: "Quick Quote",
    status: "Expired",
    monthlyPremium: 26629,
    coverageAmount: 395666,
    createdAt: "2026-05-04",
  },
  {
    quoteId: "Q-LEAD-1744147200000-849",
    quoteReference: "Q-LEAD-1744147200000-849",
    companyName: "Tech Innovations Pty Ltd",
    quoteType: "Full Quote",
    status: "Cancelled",
    monthlyPremium: 26629,
    coverageAmount: 395666,
    createdAt: "2026-05-04",
  },
];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

function QuoteBadge({ type, status }: { type: string; status?: string }) {
  const typeStyles: Record<string, { bg: string; color: string }> = {
    "Quick Quote": { bg: "#4A4A4A", color: "#FFFFFF" },
    "Full Quote": { bg: "#767676", color: "#FFFFFF" },
  };
  
  const statusStyles: Record<string, { color: string }> = {
    "Expired": { color: "#FE7F7F" },
    "Cancelled": { color: "#FE7F7F" },
    "Active": { color: "#1FC3EB" },
  };

  const typeStyle = typeStyles[type] || { bg: "#4A4A4A", color: "#FFFFFF" };
  const statusStyle = statusStyles[status || ""] || { color: "#A0A0A0" };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px 8px",
        background: typeStyle.bg,
        border: "0.625px solid rgba(237, 237, 237, 0.2)",
        borderRadius: "4px",
        fontFamily: "'Inter', sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: "16px",
        color: typeStyle.color,
      }}>
        {type}
      </span>
      {status && (
        <span style={{
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px 8px",
          border: "0.625px solid #4A4A4A",
          borderRadius: "8px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          lineHeight: "16px",
          color: statusStyle.color,
        }}>
          {status}
        </span>
      )}
    </div>
  );
}

export default function LeadDetailsPage({ leadId }: LeadDetailsPageProps) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set mock data immediately
    setLead({
      leadId,
      leadReference: leadId,
      employerName: "Universal Mining",
      registrationNumber: "2737182",
      industry: "healthcare",
      numberOfEmployees: 343,
      address: "western cape, Johannesburg, 4444.",
      contactFirstName: "John",
      contactLastName: "Doe",
      contactEmail: "Johndoe@gmail.com",
      contactPhone: "8282828233",
      contactPosition: "General HR Manager",
      status: "Active",
      createdAt: new Date().toISOString(),
    } as any);

    // Try to fetch real data in the background
    (async () => {
      try {
        const token = getValidToken() ?? "dev-token";
        const representativeId = localStorage.getItem("bp_broker_id") ?? undefined;
        
        const data = await getLeads(token, representativeId);
        const foundLead = data.find((l: Lead) => l.leadId === leadId);
        
        if (foundLead) {
          setLead(foundLead);
        }
      } catch (error) {
        console.warn("Could not fetch lead from API, using mock data:", error);
      }
    })();
  }, [leadId]);

  if (loading || !lead) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        color: "#A0A0A0",
      }}>
        Loading lead details...
      </div>
    );
  }

  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: "calc(100vh - 120px)",
      background: "rgba(24, 24, 24, 0.8)",
      border: "1px solid rgba(29, 51, 68, 0.4)",
      borderRadius: "16px",
      padding: "24px",
      boxSizing: "border-box",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Background blur */}
      <div style={{
        position: "absolute",
        width: "608px",
        height: "608px",
        right: "-100px",
        bottom: "-100px",
        background: "#00C0E8",
        opacity: 0.05,
        filter: "blur(172px)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Back Button */}
        <button
          onClick={() => router.push(ROUTES.viewLeads)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "#0F1619",
            border: "1px solid #1E3339",
            borderRadius: "8px",
            color: "#00C0E8",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "17px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Divider */}
        <div style={{
          width: "100%",
          height: "0px",
          border: "1px solid #2D343B",
          marginBottom: "31px",
        }} />

        {/* Lead Details Card */}
        <div style={{
          boxSizing: "border-box",
          background: "#1E1E1E",
          border: "1px solid #30363D",
          borderRadius: "12px",
          padding: "25px",
          marginBottom: "31px",
        }}>
          {/* Employer Details */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#E6E6E6",
              margin: "0 0 12px 0",
            }}>
              Employer Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Company Name
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {lead.employerName}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Registration Number
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {lead.registrationNumber || "N/A"}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Industry
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                  textTransform: "capitalize",
                }}>
                  {(lead as any).industry || "N/A"}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Number of Employees
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {lead.numberOfEmployees}
                </p>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Address
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {(lead as any).address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div style={{
            paddingTop: "25px",
            borderTop: "0.625px solid #4A4A4A",
          }}>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: "27px",
              letterSpacing: "-0.439453px",
              color: "#E6E6E6",
              margin: "0 0 12px 0",
            }}>
              Contact Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Contact Person
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {lead.contactFirstName} {lead.contactLastName}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Position
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {(lead as any).contactPosition || "N/A"}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Email
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {lead.contactEmail}
                </p>
              </div>

              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#A0A0A0",
                  margin: "0 0 4px 0",
                }}>
                  Phone
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  margin: 0,
                }}>
                  {(lead as any).contactPhone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Quotes Section */}
        <h2 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "18px",
          fontWeight: 500,
          lineHeight: "36px",
          letterSpacing: "0.0703125px",
          color: "#FFFFFF",
          margin: "0 0 17px 0",
        }}>
          Previous Quotes
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "17px" }}>
          {quotes.map((quote) => (
            <div key={quote.quoteId} style={{
              boxSizing: "border-box",
              background: "#1E1E1E",
              border: "0.625px solid #4A4A4A",
              borderRadius: "10px",
              padding: "25px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {/* Quote Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "18px",
                      fontWeight: 500,
                      lineHeight: "27px",
                      letterSpacing: "-0.439453px",
                      color: "#FFFFFF",
                      margin: 0,
                    }}>
                      {quote.companyName}
                    </h3>
                    <QuoteBadge type={quote.quoteType} status={quote.status} />
                  </div>

                  {/* Quote Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                    <div>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#A0A0A0",
                        margin: "0 0 4px 0",
                      }}>
                        Quote ID
                      </p>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#FFFFFF",
                        margin: 0,
                      }}>
                        {quote.quoteReference}
                      </p>
                    </div>

                    <div>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#A0A0A0",
                        margin: "0 0 4px 0",
                      }}>
                        Monthly Premium
                      </p>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#1FC3EB",
                        margin: 0,
                      }}>
                        R {quote.monthlyPremium.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#A0A0A0",
                        margin: "0 0 4px 0",
                      }}>
                        Coverage Amount
                      </p>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#FFFFFF",
                        margin: 0,
                      }}>
                        R {quote.coverageAmount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#A0A0A0",
                        margin: "0 0 4px 0",
                      }}>
                        Created Date
                      </p>
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        letterSpacing: "-0.150391px",
                        color: "#FFFFFF",
                        margin: 0,
                      }}>
                        {fmt(quote.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button style={{
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  width: "137px",
                  height: "36px",
                  background: "rgba(58, 58, 58, 0.3)",
                  border: "0.625px solid #3A3A3A",
                  borderRadius: "8px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  letterSpacing: "-0.150391px",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}>
                  Download Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
