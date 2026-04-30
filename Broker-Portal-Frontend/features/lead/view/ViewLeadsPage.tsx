"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Filter, Search, Eye, Play, X, ChevronDown, Check } from "lucide-react";
import { getLeads, cancelLead, Lead } from "@/lib/api/leads";
import { ROUTES } from "@/lib/constants";
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── mock data ────────────────────────────────────────────────────────────────

const MOCK_LEADS: Lead[] = [
  { leadId: "LD-1001", leadReference: "LD-1001", employerName: "Micro-Tech Solutions",   registrationNumber: "2023/123456/07", numberOfEmployees: 1,    contactFirstName: "Alice",  contactLastName: "Smith",    contactEmail: "alice@microtech.co.za",    status: "Draft",         quoteStatus: "Pending Approval", createdAt: "2026-04-30" },
  { leadId: "LD-1002", leadReference: "LD-1002", employerName: "Mining Giants SA",        registrationNumber: "1995/654321/07", numberOfEmployees: 1250, contactFirstName: "Bob",    contactLastName: "Johnson",  contactEmail: "bob@mininggiants.co.za",   status: "In Progress",   quoteStatus: "Quick Quote",      createdAt: "2026-04-28" },
  { leadId: "LD-1003", leadReference: "LD-1003", employerName: "H Plus Construction",     registrationNumber: "2008/445566/07", numberOfEmployees: 45,   contactFirstName: "Claire", contactLastName: "Davis",    contactEmail: "claire@hplus.co.za",       status: "Completed",     quoteStatus: "Accepted",         createdAt: "2026-04-20" },
  { leadId: "LD-1004", leadReference: "LD-1004", employerName: "Agri Growth SA",          registrationNumber: "2001/778899/07", numberOfEmployees: 500,  contactFirstName: "Dirk",   contactLastName: "Snyman",   contactEmail: "dirk@agrigrowth.co.za",    status: "Quote Expired", quoteStatus: "Rejected",         createdAt: "2026-04-25" },
  { leadId: "LD-1005", leadReference: "LD-1005", employerName: "Safe Build Construction", registrationNumber: "2015/334455/07", numberOfEmployees: 150,  contactFirstName: "Edward", contactLastName: "Norton",   contactEmail: "edward@safebuild.co.za",   status: "In Progress",   quoteStatus: "Full Quote",       createdAt: "2026-04-29" },
  { leadId: "LD-1006", leadReference: "LD-1006", employerName: "Cape Retail Group",       registrationNumber: "2010/987654/07", numberOfEmployees: 340,  contactFirstName: "Carol",  contactLastName: "Williams", contactEmail: "carol@caperetail.co.za",   status: "In Progress",   quoteStatus: "Full Quote",       createdAt: "2026-04-27" },
  { leadId: "LD-1007", leadReference: "LD-1007", employerName: "Joburg Finance Ltd",      registrationNumber: "2005/112233/07", numberOfEmployees: 85,   contactFirstName: "David",  contactLastName: "Brown",    contactEmail: "david@joburgfinance.co.za",status: "Completed",     quoteStatus: "Approved",         createdAt: "2026-04-25" },
  { leadId: "LD-1008", leadReference: "LD-1008", employerName: "Sunrise Logistics",       registrationNumber: "2012/556677/07", numberOfEmployees: 220,  contactFirstName: "Fatima", contactLastName: "Moosa",    contactEmail: "fatima@sunrise.co.za",     status: "Draft",         quoteStatus: "Pending Approval", createdAt: "2026-04-22" },
  { leadId: "LD-1009", leadReference: "LD-1009", employerName: "Blue Ocean Trading",      registrationNumber: "2018/223344/07", numberOfEmployees: 60,   contactFirstName: "George", contactLastName: "Nkosi",    contactEmail: "george@blueocean.co.za",   status: "Cancelled",     quoteStatus: undefined,          createdAt: "2026-04-18" },
  { leadId: "LD-1010", leadReference: "LD-1010", employerName: "Pinnacle Energy",         registrationNumber: "2020/667788/07", numberOfEmployees: 410,  contactFirstName: "Hannah", contactLastName: "Pretorius",contactEmail: "hannah@pinnacle.co.za",    status: "In Progress",   quoteStatus: "Quick Quote",      createdAt: "2026-04-15" },
];

const PAGE_SIZE  = 5;
// Continue + Cancel only shown for these statuses — never for Completed or Cancelled
const ACTIONABLE = ["Draft", "In Progress", "Quote Expired"];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

// ── CustomSelect — portal-based dropdown, always opens downward ──────────────

function CustomSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // close on outside click + reposition on scroll/resize
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const portal = document.getElementById("custom-select-portal");
        if (portal && portal.contains(e.target as Node)) return;
        setOpen(false);
      }
    }
    function handleScroll() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const openDropdown = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropPos({
      top:   rect.bottom + 4,
      left:  rect.left,
      width: rect.width,
    });
    setOpen((o) => !o);
  };

  // always force downward — recalc on scroll/resize already uses rect.bottom

  const borderColor = open
    ? "var(--primary)"
    : hovered
    ? "color-mix(in srgb, var(--primary) 50%, transparent)"
    : "var(--border)";

  const boxShadow = open
    ? "0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent)"
    : "none";

  // portal dropdown rendered via createPortal
  const dropdown = open ? ReactDOM.createPortal(
    <div
      id="custom-select-portal"
      style={{
        position:     "fixed",
        top:          dropPos.top,
        left:         dropPos.left,
        width:        dropPos.width,
        background:   "var(--card)",
        border:       "1px solid var(--border)",
        borderRadius: "8px",
        zIndex:       9999,
        boxShadow:    "0 8px 24px rgba(0,0,0,0.5)",
        overflow:     "hidden",
        maxHeight:    `calc(100vh - ${dropPos.top + 8}px)`,
        overflowY:    "auto",
      }}
    >
      {options.map((opt) => {
        const isSelected = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              width:          "100%",
              textAlign:      "left",
              padding:        "9px 14px",
              fontSize:       "14px",
              color:          isSelected ? "var(--primary)" : "var(--foreground)",
              background:     isSelected ? "rgba(31,195,235,0.08)" : "transparent",
              border:         "none",
              cursor:         "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = isSelected
                ? "rgba(31,195,235,0.14)"
                : "var(--sidebar-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = isSelected
                ? "rgba(31,195,235,0.08)"
                : "transparent";
            }}
          >
            <span>{opt}</span>
            {isSelected && <Check size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        suppressHydrationWarning
        type="button"
        onClick={openDropdown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: "40px", width: "100%", borderRadius: "6px",
          border: `2px solid ${borderColor}`,
          background: "var(--input)",
          padding: "0 36px 0 12px",
          fontSize: "14px", color: "var(--foreground)",
          outline: "none", cursor: "pointer",
          display: "flex", alignItems: "center",
          boxShadow, transition: "border-color 0.15s, box-shadow 0.15s",
          whiteSpace: "nowrap", textAlign: "left",
          boxSizing: "border-box", position: "relative",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
        <ChevronDown
          size={16}
          style={{
            position: "absolute", right: "10px", top: "50%",
            transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
            pointerEvents: "none", opacity: 0.5,
            color: "var(--muted-foreground)",
            transition: "transform 0.15s",
          }}
        />
      </button>
      {dropdown}
    </>
  );
}

// ── component ────────────────────────────────────────────────────────────────

export default function ViewLeadsPage() {
  const router = useRouter();
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Statuses");
  const [quoteFilter, setQuote]   = useState("All Quote Statuses");
  const [page, setPage]           = useState(1);

  const handleCancel = (leadId: string) => {
    // optimistic update
    setLeads((prev) =>
      prev.map((l) => l.leadId === leadId ? { ...l, status: "Cancelled" } : l)
    );
    const token = localStorage.getItem("bp_token") ?? "";
    cancelLead(leadId, token);
  };

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("bp_token") ?? "";
        const representativeId = localStorage.getItem("bp_broker_id") ?? localStorage.getItem("bp_representative_id") ?? undefined;
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
      (statusFilter === "All Statuses"       || l.status      === statusFilter) &&
      (quoteFilter  === "All Quote Statuses" || l.quoteStatus === quoteFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PAGE_SIZE;
  const rows       = filtered.slice(start, start + PAGE_SIZE);

  const total     = leads.length;
  const active    = leads.filter((l) => l.status === "In Progress").length;
  const completed = leads.filter((l) => l.status === "Completed").length;
  const cancelled = leads.filter((l) => l.status === "Cancelled").length;

  const card: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--input)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "0 12px",
    height: "40px",
    fontSize: "0.875rem",
    color: "var(--foreground)",
    outline: "none",
    width: "100%",
  };

  const pageBtn = (isActive: boolean, disabled?: boolean): React.CSSProperties => ({
    height: "32px",
    minWidth: "32px",
    padding: "0 10px",
    borderRadius: "6px",
    border: isActive ? "none" : "1px solid var(--border)",
    background: isActive ? "var(--primary)" : "transparent",
    color: isActive ? "#0a0a0a" : disabled ? "#4b5563" : "var(--foreground)",
    fontSize: "14px",
    fontWeight: isActive ? 700 : 400,
    cursor: disabled ? "default" : "pointer",
    transition: "background 0.15s",
  });

  return (
    <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Stats ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
          className="grid-cols-1 sm:grid-cols-4"
        >
          {[
            { label: "Total Leads", value: total,     color: "var(--primary)" },
            { label: "Active",      value: active,    color: "var(--foreground)" },
            { label: "Completed",   value: completed, color: "#22c55e" },
            { label: "Cancelled",   value: cancelled, color: "var(--destructive)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.625rem",
              padding: "16px",
              width: "100%",
              height: "auto",
            }}>
              <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginBottom: "4px" }}>{label}</p>
              <p style={{ fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 400, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* ── Search & Filter ── */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Filter size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: "20px", color: "var(--foreground)" }}>Search &amp; Filter</span>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => router.push(ROUTES.newLead)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgb(31, 195, 235)", color: "rgb(255, 255, 255)",
                border: "none", borderRadius: "8px",
                padding: "8px 12px", height: "36px",
                fontWeight: 500, fontSize: "14px", cursor: "pointer",
                transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                flexShrink: 0, whiteSpace: "nowrap",
              }}
            >
              <Plus size={16} /> Start New Lead
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search input — spans 2 cols */}
            <div style={{ position: "relative", gridColumn: "span 2" }}>
              <Search size={16} style={{
                position: "absolute", left: "12px", top: "50%",
                transform: "translateY(-50%)", color: "var(--muted-foreground)",
                pointerEvents: "none", flexShrink: 0,
              }} />
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search by company name, lead ID, registration number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "40px", width: "100%", borderRadius: "6px",
                  border: "2px solid var(--border)",
                  background: "var(--input)",
                  padding: "8px 12px 8px 40px",
                  fontSize: "14px", color: "var(--foreground)", outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.currentTarget)
                    e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 50%, transparent)";
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.currentTarget)
                    e.currentTarget.style.borderColor = "var(--border)";
                }}
              />
            </div>

            {/* Status select */}
            <CustomSelect
              value={statusFilter}
              onChange={setStatus}
              options={["All Statuses", "Draft", "In Progress", "Completed", "Cancelled", "Quote Expired"]}
            />

            {/* Quote Status select */}
            <CustomSelect
              value={quoteFilter}
              onChange={setQuote}
              options={["All Quote Statuses", "Pending Approval", "Quick Quote", "Full Quote", "Approved", "Accepted", "Rejected"]}
            />
          </div>
        </div>

        {/* ── Separator ── */}
        <div style={{ borderTop: "1px solid var(--border)", marginTop: "-8px" }} />

        {/* ── Table container: bg-card border border-border rounded-lg overflow-hidden ── */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--foreground)" }}>Your Leads</p>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "2px" }}>
              Showing {filtered.length} of {total} leads
            </p>
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af" }}>Loading leads…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ color: "#9ca3af", marginBottom: "16px" }}>No leads found.</p>
              <button
                onClick={() => router.push(ROUTES.newLead)}
                style={{ background: "var(--primary)", color: "#0a0a0a", border: "none", borderRadius: "6px", padding: "8px 20px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Create First Lead
              </button>
            </div>
          ) : (
            /* Table — relative w-full overflow-x-auto wraps the <table> w-full caption-bottom text-sm */
            <Table>
              <TableHeader>
                <TableRow>
                  {["Lead ID", "Company Name", "Contact Person", "Employees", "Status", "Quote Status", "Created Date", "Actions"].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((lead) => {
                  const actionable = ACTIONABLE.includes(lead.status);
                  return (
                    <TableRow key={lead.leadId}>
                      {/* Lead ID — font-mono text-sm */}
                      <TableCell className="font-mono" style={{ color: "var(--primary)", fontWeight: 500, fontSize: "14px" }}>
                        {lead.leadReference}
                      </TableCell>

                      {/* Company */}
                      <TableCell>
                        <p style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 500 }}>{lead.employerName}</p>
                        {lead.registrationNumber && (
                          <p style={{ fontSize: "14px", color: "#9ca3af" }}>{lead.registrationNumber}</p>
                        )}
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <p style={{ fontSize: "14px", color: "var(--foreground)" }}>{lead.contactFirstName} {lead.contactLastName}</p>
                        <p style={{ fontSize: "14px", color: "#9ca3af" }}>{lead.contactEmail}</p>
                      </TableCell>

                      {/* Employees */}
                      <TableCell style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        {lead.numberOfEmployees.toLocaleString()}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge label={lead.status} type="status" />
                      </TableCell>

                      {/* Quote Status */}
                      <TableCell>
                        <Badge label={lead.quoteStatus} type="quote" />
                      </TableCell>

                      {/* Date */}
                      <TableCell style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        {fmt(lead.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* View */}
                          <Button variant="view" size="sm" onClick={() => router.push(`/lead/${lead.leadId}/quote`)}>
                            <Eye size={14} /> View
                          </Button>

                          {/* Continue — navigates to quote journey */}
                          {actionable && (
                            <Button variant="continue" size="sm" onClick={() =>
                              router.push(`/lead/${lead.leadId}/quote?ref=${lead.leadReference}&company=${encodeURIComponent(lead.employerName)}`)
                            }>
                              <Play size={12} /> Continue
                            </Button>
                          )}

                          {/* Cancel — sets status to Cancelled */}
                          {actionable && (
                            <Button variant="destructive" size="sm" onClick={() => handleCancel(lead.leadId)}>
                              <X size={12} /> Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* ── Pagination — p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 ── */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                Showing {start + 1} to {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button disabled={safePage === 1} onClick={() => setPage((p) => p - 1)} style={pageBtn(false, safePage === 1)}>
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} style={pageBtn(n === safePage)}>
                    {n}
                  </button>
                ))}
                <button disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)} style={pageBtn(false, safePage === totalPages)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
