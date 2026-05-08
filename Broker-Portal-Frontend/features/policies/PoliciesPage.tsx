"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Users, DollarSign, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Policy {
  policyNumber: string;
  companyName: string;
  effectiveDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Cancelled" | "Pending";
  premium: number;
  coverage: number;
}

const MOCK_POLICIES: Policy[] = [
  { policyNumber: "POL-2026-081", companyName: "Medical Care Group",          effectiveDate: "01/04/2026", expiryDate: "31/03/2027", status: "Active",  premium: 16750,  coverage: 67000000  },
  { policyNumber: "POL-2026-082", companyName: "FinServe Financial Solutions", effectiveDate: "01/04/2026", expiryDate: "31/03/2027", status: "Active",  premium: 23750,  coverage: 95000000  },
  { policyNumber: "POL-2025-089", companyName: "Tech Innovations Pty Ltd",    effectiveDate: "01/06/2025", expiryDate: "31/05/2026", status: "Active",  premium: 21250,  coverage: 85000000  },
  { policyNumber: "POL-2025-067", companyName: "Retail Excellence Ltd",       effectiveDate: "01/09/2025", expiryDate: "31/08/2026", status: "Active",  premium: 44500,  coverage: 178000000 },
];

const STATUS_OPTIONS = ["All Statuses", "Active", "Expired", "Cancelled", "Pending"];

const fmt = (n: number) => `R ${n.toLocaleString("en-ZA")}`;

export default function PoliciesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = MOCK_POLICIES.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!q || p.companyName.toLowerCase().includes(q) || p.policyNumber.toLowerCase().includes(q)) &&
      (statusFilter === "All Statuses" || p.status === statusFilter)
    );
  });

  const card: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto space-y-6">

          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--foreground)" }}>Policies</h1>

          {/* Search + Status filter */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "480px" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search by company name or policy no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", padding: "0 12px 0 36px", fontSize: "13px", color: "var(--foreground)", outline: "none" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", color: "var(--foreground)", fontSize: "13px", cursor: "pointer", minWidth: "140px", justifyContent: "space-between" }}
              >
                <span>{statusFilter}</span>
                <ChevronDown size={14} style={{ opacity: 0.5, transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
              {dropdownOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: "140px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", zIndex: 50, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                  {STATUS_OPTIONS.map((opt) => (
                    <button key={opt} onMouseDown={() => { setStatusFilter(opt); setDropdownOpen(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: "13px", color: opt === statusFilter ? "var(--primary)" : "var(--foreground)", background: opt === statusFilter ? "rgba(31,195,235,0.08)" : "transparent", border: "none", cursor: "pointer" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ ...card, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
              <thead>
                <tr>
                  {["Policy Number", "Company Name", "Effective Date", "Expiry Date", "Status", "Premium", "Coverage", "Actions"].map((h) => (
                    <th key={h} style={{ height: "48.61px", padding: "0 12px", textAlign: "left", fontSize: "13px", fontWeight: 500, color: "#9ca3af", whiteSpace: "nowrap", borderBottom: "0.63px solid var(--border)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#9ca3af", fontSize: "13px" }}>No policies found.</td></tr>
                ) : filtered.map((policy, i) => (
                  <tr key={policy.policyNumber}
                    style={{ borderBottom: i < filtered.length - 1 ? "0.63px solid var(--border)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td style={{ height: "48.61px", padding: "0 12px", color: "var(--foreground)", fontWeight: 500, fontSize: "13px", whiteSpace: "nowrap" }}>{policy.policyNumber}</td>
                    <td style={{ height: "48.61px", padding: "0 12px", color: "var(--foreground)", fontSize: "13px", whiteSpace: "nowrap" }}>{policy.companyName}</td>
                    <td style={{ height: "48.61px", padding: "0 12px", color: "var(--foreground)", fontSize: "13px", whiteSpace: "nowrap" }}>{policy.effectiveDate}</td>
                    <td style={{ height: "48.61px", padding: "0 12px", color: "var(--foreground)", fontSize: "13px", whiteSpace: "nowrap" }}>{policy.expiryDate}</td>
                    <td style={{ height: "48.61px", padding: "0 12px", whiteSpace: "nowrap" }}><Badge label={policy.status} type="status" /></td>
                    <td style={{ height: "48.61px", padding: "0 12px", color: "var(--foreground)", fontSize: "13px", whiteSpace: "nowrap" }}>{fmt(policy.premium)}</td>
                    <td style={{ height: "48.61px", padding: "0 12px", color: "var(--foreground)", fontSize: "13px", whiteSpace: "nowrap" }}>{fmt(policy.coverage)}</td>
                    <td style={{ height: "48.61px", padding: "0 12px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ActionBtn icon={<Eye size={13} />} label="View" onClick={() => router.push(`/policies/${policy.policyNumber}`)} />
                        <ActionBtn icon={<Users size={13} />} label="Members" onClick={() => router.push(`/policies/${policy.policyNumber}?tab=Members`)} />
                        <ActionBtn icon={<DollarSign size={13} />} label="Payments" onClick={() => router.push(`/policies/${policy.policyNumber}?tab=Payments`)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        height: "28px", padding: "0 10px", borderRadius: "6px",
        border: "1px solid var(--border)",
        background: "transparent", color: "var(--foreground)",
        fontSize: "12px", cursor: "pointer",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(31,195,235,0.1)";
        el.style.color = "var(--primary)";
        el.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "transparent";
        el.style.color = "var(--foreground)";
        el.style.borderColor = "var(--border)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
