"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getLeads, cancelLead, Lead } from "@/lib/api/leads";
import { getValidToken } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

const PAGE_SIZE = 10;

const MOCK_LEADS: Lead[] = [
  { leadId: "LEAD-1744147200000-847", leadReference: "LEAD-1744147200000-847", employerName: "Tech Innovations Pty Ltd",    registrationNumber: "2019/123456/07", numberOfEmployees: 85,  contactFirstName: "Sarah",   contactLastName: "Mitchell",  contactEmail: "sarah.mitchell@techinnovations.co.za", status: "Active",    quoteStatus: "Expired",                  createdAt: "2026-04-01" },
  { leadId: "LEAD-1744060800000-392", leadReference: "LEAD-1744060800000-392", employerName: "Green Energy Solutions",       registrationNumber: "2020/987654/07", numberOfEmployees: 142, contactFirstName: "David",   contactLastName: "Chen",      contactEmail: "david.chen@greenenergy.co.za",         status: "Active",    quoteStatus: "Submitted for Onboarding", createdAt: "2026-03-30" },
  { leadId: "LEAD-1743974400000-621", leadReference: "LEAD-1743974400000-621", employerName: "Medical Care Group",           registrationNumber: "2018/456789/07", numberOfEmployees: 67,  contactFirstName: "Dr. Priya",contactLastName: "Naidoo",    contactEmail: "priya.naidoo@medicalcare.co.za",       status: "Active",    quoteStatus: undefined,                  createdAt: "2026-03-28" },
  { leadId: "LEAD-1743888000000-158", leadReference: "LEAD-1743888000000-158", employerName: "Build Master Construction",    registrationNumber: "2017/654321/07", numberOfEmployees: 210, contactFirstName: "John",    contactLastName: "van der Merwe", contactEmail: "john.vdm@buildmaster.co.za",       status: "Draft",     quoteStatus: undefined,                  createdAt: "2026-03-25" },
  { leadId: "LEAD-1743801600000-943", leadReference: "LEAD-1743801600000-943", employerName: "Retail Excellence Ltd",        registrationNumber: "2021/111222/07", numberOfEmployees: 178, contactFirstName: "Amanda",  contactLastName: "Botha",     contactEmail: "amanda.botha@retailexcellence.co.za",  status: "Active",    quoteStatus: "Expired",                  createdAt: "2026-03-22" },
  { leadId: "LEAD-1743715200000-276", leadReference: "LEAD-1743715200000-276", employerName: "EduTech Academy",              registrationNumber: "2019/333444/07", numberOfEmployees: 52,  contactFirstName: "Michael", contactLastName: "Sithole",   contactEmail: "michael.sithole@edutech.co.za",        status: "Cancelled", quoteStatus: "Cancelled",                createdAt: "2026-03-20" },
  { leadId: "LEAD-1743628800000-512", leadReference: "LEAD-1743628800000-512", employerName: "FinServe Financial Solutions",  registrationNumber: "2016/555666/07", numberOfEmployees: 95,  contactFirstName: "Lisa",    contactLastName: "Malherbe",  contactEmail: "lisa.malherbe@finserve.co.za",         status: "Active",    quoteStatus: "Cancelled",                createdAt: "2026-03-18" },
  { leadId: "LEAD-1743542400000-789", leadReference: "LEAD-1743542400000-789", employerName: "Manufacturing Pro Industries", registrationNumber: "2015/777888/07", numberOfEmployees: 320, contactFirstName: "Thabo",   contactLastName: "Mdluli",    contactEmail: "thabo.mdluli@mfgpro.co.za",            status: "Active",    quoteStatus: "Submitted for Onboarding", createdAt: "2026-03-15" },
  { leadId: "LEAD-1743456000000-034", leadReference: "LEAD-1743456000000-034", employerName: "Digital Marketing Hub",        registrationNumber: "2022/999000/07", numberOfEmployees: 41,  contactFirstName: "Emma",    contactLastName: "Watson",    contactEmail: "emma.watson@digitalhub.co.za",         status: "Draft",     quoteStatus: undefined,                  createdAt: "2026-03-12" },
  { leadId: "LEAD-1743369600000-467", leadReference: "LEAD-1743369600000-467", employerName: "Transport & Logistics Co",     registrationNumber: "2014/222333/07", numberOfEmployees: 156, contactFirstName: "Raymond", contactLastName: "Kgosi",     contactEmail: "raymond.kgosi@transport.co.za",        status: "Active",    quoteStatus: "Submitted for Onboarding", createdAt: "2026-03-10" },
];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "Active":    { bg: "#00B8DB", color: "#fff" },
    "Draft":     { bg: "#3A3A3A", color: "#fff" },
    "Cancelled": { bg: "#EF4444", color: "#fff" },
    "Completed": { bg: "#22c55e", color: "#fff" },
  };
  const s = styles[status] ?? { bg: "#4B4B4B", color: "#fff" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "8px",
      background: s.bg,
      color: s.color,
      fontSize: "12px",
      fontWeight: 500,
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

function QuoteBadge({ quoteStatus }: { quoteStatus?: string }) {
  if (!quoteStatus) return <span style={{ color: "#A0A0A0", fontSize: "14px" }}>—</span>;

  const styles: Record<string, { bg: string; color: string; opacity?: number }> = {
    "Quick Quote":              { bg: "#4B4B4B", color: "#fff" },
    "Full Quote":               { bg: "#6B6B6B", color: "#fff" },
    "Submitted for Onboarding": { bg: "rgba(0,201,80,0.9)", color: "#fff" },
    "Expired":                  { bg: "#4B4B4B", color: "#fff", opacity: 0.5 },
    "Cancelled":                { bg: "#EF4444", color: "#fff" },
    "Approved":                 { bg: "rgba(0,201,80,0.9)", color: "#fff" },
  };
  const s = styles[quoteStatus] ?? { bg: "#4B4B4B", color: "#fff" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "8px",
      background: s.bg,
      color: s.color,
      fontSize: "12px",
      fontWeight: 500,
      opacity: s.opacity ?? 1,
      whiteSpace: "nowrap",
    }}>
      {quoteStatus}
    </span>
  );
}

export default function ViewLeadsPage() {
  const router = useRouter();
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [quoteFilter, setQuote]   = useState("All");
  const [page, setPage]           = useState(1);
  const [statusOpen, setStatusOpen] = useState(false);
  const [quoteOpen, setQuoteOpen]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = getValidToken() ?? "dev-token";
        const representativeId = localStorage.getItem("bp_broker_id") ?? undefined;
        const data = await getLeads(token, representativeId);
        setLeads(data.length ? data : MOCK_LEADS);
      } catch {
        setLeads(MOCK_LEADS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { setPage(1); }, [search, statusFilter, quoteFilter]);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      (!q || l.employerName.toLowerCase().includes(q) || l.leadReference.toLowerCase().includes(q) || (l.registrationNumber ?? "").toLowerCase().includes(q)) &&
      (statusFilter === "All" || l.status === statusFilter) &&
      (quoteFilter  === "All" || l.quoteStatus === quoteFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PAGE_SIZE;
  const rows       = filtered.slice(start, start + PAGE_SIZE);

  const total     = leads.length;
  const active    = leads.filter((l) => l.status === "Active" || l.status === "In Progress").length;
  const accepted  = leads.filter((l) => l.status === "Completed").length;
  const cancelled = leads.filter((l) => l.status === "Cancelled").length;

  const statusOptions = ["All", "Active", "Draft", "Cancelled", "Completed"];
  const quoteOptions  = ["All", "Quick Quote", "Full Quote", "Submitted for Onboarding", "Expired", "Cancelled", "Approved"];

  return (
    <div className="relative w-full h-full overflow-y-auto">
      {/* Background blur */}
      <div className="absolute pointer-events-none" style={{
        width: "608px", height: "608px",
        right: "-100px", bottom: "-100px",
        background: "#00C0E8", opacity: 0.05,
        filter: "blur(172px)", borderRadius: "50%",
      }} />

      <div className="px-6 pt-6 pb-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#FFFFFF", letterSpacing: "0.07px" }}>Leads</h1>
          <button
            onClick={() => router.push(ROUTES.newLead)}
            className="flex items-center gap-2"
            style={{
              background: "#1FC3EB", color: "#0A0A0A",
              border: "none", borderRadius: "8px",
              padding: "8px 13px", height: "40px",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            <Plus size={20} />
            Add New Lead
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-[22px]">
          {[
            { label: "Total Leads", value: total },
            { label: "Active",      value: active },
            { label: "Accepted",    value: accepted },
            { label: "Cancelled",   value: cancelled },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1,
              background: "#262626",
              border: "1px solid #30363D",
              borderRadius: "12px",
              height: "88px",
              padding: "0 23px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "3px",
            }}>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#E6E6E6", lineHeight: "24px" }}>{value}</p>
              <p style={{ fontSize: "14px", fontWeight: 400, color: "#C5C5C5", lineHeight: "17px" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative" style={{ width: "648px" }}>
            <Search size={20} style={{
              position: "absolute", left: "10px", top: "50%",
              transform: "translateY(-50%)", color: "#A0A0A0",
              pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder="Search by company name or lead ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", height: "40px",
                background: "#262626", border: "1.875px solid #333333",
                borderRadius: "8px", padding: "8px 12px 8px 40px",
                fontSize: "14px", color: "#FFFFFF",
                outline: "none", letterSpacing: "-0.15px",
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="relative" style={{ width: "220px" }}>
            <button
              onClick={() => { setStatusOpen(!statusOpen); setQuoteOpen(false); }}
              style={{
                width: "100%", height: "40px",
                background: "#262626", border: "1.875px solid #333333",
                borderRadius: "8px", padding: "8px 12px",
                fontSize: "14px", color: "#A0A0A0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", outline: "none",
              }}
            >
              <span style={{ fontWeight: 500, letterSpacing: "-0.15px" }}>
                {statusFilter === "All" ? "Status" : statusFilter}
              </span>
              <ChevronDown size={16} style={{ opacity: 0.5 }} />
            </button>
            {statusOpen && (
              <div style={{
                position: "absolute", top: "44px", left: 0, width: "100%",
                background: "#262626", border: "1px solid #333333",
                borderRadius: "8px", zIndex: 50, overflow: "hidden",
              }}>
                {statusOptions.map((opt) => (
                  <button key={opt} onClick={() => { setStatus(opt); setStatusOpen(false); }}
                    style={{
                      width: "100%", padding: "9px 14px", textAlign: "left",
                      fontSize: "14px", color: statusFilter === opt ? "#1FC3EB" : "#FFFFFF",
                      background: statusFilter === opt ? "rgba(31,195,235,0.08)" : "transparent",
                      border: "none", cursor: "pointer",
                    }}
                  >
                    {opt === "All" ? "All Statuses" : opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quote Status Filter */}
          <div className="relative" style={{ width: "220px" }}>
            <button
              onClick={() => { setQuoteOpen(!quoteOpen); setStatusOpen(false); }}
              style={{
                width: "100%", height: "40px",
                background: "#262626", border: "1.875px solid #333333",
                borderRadius: "8px", padding: "8px 12px",
                fontSize: "14px", color: "#A0A0A0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", outline: "none",
              }}
            >
              <span style={{ fontWeight: 500, letterSpacing: "-0.15px" }}>
                {quoteFilter === "All" ? "Quote Status" : quoteFilter}
              </span>
              <ChevronDown size={16} style={{ opacity: 0.5 }} />
            </button>
            {quoteOpen && (
              <div style={{
                position: "absolute", top: "44px", left: 0, width: "220px",
                background: "#262626", border: "1px solid #333333",
                borderRadius: "8px", zIndex: 50, overflow: "hidden",
              }}>
                {quoteOptions.map((opt) => (
                  <button key={opt} onClick={() => { setQuote(opt); setQuoteOpen(false); }}
                    style={{
                      width: "100%", padding: "9px 14px", textAlign: "left",
                      fontSize: "14px", color: quoteFilter === opt ? "#1FC3EB" : "#FFFFFF",
                      background: quoteFilter === opt ? "rgba(31,195,235,0.08)" : "transparent",
                      border: "none", cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {opt === "All" ? "All Quote Statuses" : opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: "#2D2D2D",
          border: "0.625px solid #4A4A4A",
          borderRadius: "10px",
          overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#A0A0A0" }}>Loading leads…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "#A0A0A0", marginBottom: "16px" }}>No leads found.</p>
              <button onClick={() => router.push(ROUTES.newLead)} style={{
                background: "#1FC3EB", color: "#0A0A0A", border: "none",
                borderRadius: "6px", padding: "8px 20px", fontWeight: 600,
                fontSize: "14px", cursor: "pointer",
              }}>
                Create First Lead
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                {/* Header */}
                <thead>
                  <tr style={{ background: "rgba(58,58,58,0.5)", borderBottom: "0.625px solid #4A4A4A" }}>
                    {["Lead ID", "Company Name", "Contact Person", "Employees", "Status", "Quote", "Quote Status", "Created Date", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 8px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        letterSpacing: "-0.15px",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {rows.map((lead) => (
                    <tr key={lead.leadId} style={{ borderBottom: "0.625px solid #4A4A4A" }}>
                      {/* Lead ID */}
                      <td style={{ padding: "16px 8px", fontFamily: "Menlo, monospace", fontSize: "14px", color: "#FFFFFF", whiteSpace: "nowrap" }}>
                        {lead.leadReference}
                      </td>

                      {/* Company Name */}
                      <td style={{ padding: "8px 8px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", letterSpacing: "-0.15px" }}>{lead.employerName}</p>
                        {lead.registrationNumber && (
                          <p style={{ fontSize: "12px", color: "#A0A0A0", marginTop: "2px" }}>{lead.registrationNumber}</p>
                        )}
                      </td>

                      {/* Contact Person */}
                      <td style={{ padding: "8px 8px" }}>
                        <p style={{ fontSize: "14px", color: "#FFFFFF", letterSpacing: "-0.15px" }}>{lead.contactFirstName} {lead.contactLastName}</p>
                        <p style={{ fontSize: "12px", color: "#A0A0A0", marginTop: "2px" }}>{lead.contactEmail}</p>
                      </td>

                      {/* Employees */}
                      <td style={{ padding: "16px 8px", fontSize: "14px", color: "#FFFFFF", textAlign: "center", letterSpacing: "-0.15px" }}>
                        {lead.numberOfEmployees.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 8px" }}>
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Quote type */}
                      <td style={{ padding: "16px 8px" }}>
                        {lead.quoteStatus && (lead.quoteStatus === "Quick Quote" || lead.quoteStatus === "Full Quote")
                          ? <QuoteBadge quoteStatus={lead.quoteStatus} />
                          : <span style={{ color: "#A0A0A0", fontSize: "14px" }}>—</span>
                        }
                      </td>

                      {/* Quote Status */}
                      <td style={{ padding: "16px 8px" }}>
                        <QuoteBadge quoteStatus={
                          lead.quoteStatus === "Quick Quote" || lead.quoteStatus === "Full Quote"
                            ? undefined
                            : lead.quoteStatus
                        } />
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: "16px 8px", fontSize: "14px", color: "#FFFFFF", letterSpacing: "-0.15px", whiteSpace: "nowrap" }}>
                        {fmt(lead.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            onClick={() => router.push(`/lead/${lead.leadId}/quote`)}
                            style={{
                              display: "flex", alignItems: "center", gap: "6px",
                              padding: "6px 10px", height: "32px",
                              background: "rgba(58,58,58,0.5)", border: "0.625px solid #4A4A4A",
                              borderRadius: "8px", color: "#FFFFFF",
                              fontSize: "14px", fontWeight: 500, cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Eye size={14} />
                            View
                          </button>
                          {lead.status !== "Cancelled" && lead.status !== "Completed" && (
                            <button
                              onClick={() => router.push(`/quotes/new?leadId=${lead.leadId}&ref=${lead.leadReference}&company=${encodeURIComponent(lead.employerName)}`)}
                              style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "6px 10px", height: "32px",
                                background: "#1FC3EB", border: "none",
                                borderRadius: "8px", color: "#0A0A0A",
                                fontSize: "14px", fontWeight: 500, cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Continue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div style={{
              padding: "12px 16px",
              borderTop: "0.625px solid #4A4A4A",
              background: "rgba(58,58,58,0.3)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "14px", color: "#A0A0A0", letterSpacing: "-0.15px" }}>
                Showing {start + 1} to {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {/* Previous */}
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "6px 10px", height: "32px",
                    background: "transparent", border: "0.625px solid #4A4A4A",
                    borderRadius: "8px", color: safePage === 1 ? "#4A4A4A" : "#FFFFFF",
                    fontSize: "14px", fontWeight: 500, cursor: safePage === 1 ? "default" : "pointer",
                    opacity: safePage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} style={{
                    width: "32px", height: "32px",
                    background: n === safePage ? "#1FC3EB" : "transparent",
                    border: n === safePage ? "none" : "0.625px solid #4A4A4A",
                    borderRadius: "8px",
                    color: n === safePage ? "#0A0A0A" : "#FFFFFF",
                    fontSize: "14px", fontWeight: 500, cursor: "pointer",
                  }}>
                    {n}
                  </button>
                ))}

                {/* Next */}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "6px 10px", height: "32px",
                    background: "transparent", border: "0.625px solid #4A4A4A",
                    borderRadius: "8px", color: safePage === totalPages ? "#4A4A4A" : "#FFFFFF",
                    fontSize: "14px", fontWeight: 500, cursor: safePage === totalPages ? "default" : "pointer",
                    opacity: safePage === totalPages ? 0.5 : 1,
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
