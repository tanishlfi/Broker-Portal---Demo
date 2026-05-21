"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Plus, Search, Eye, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

import { getLeads, Lead } from "@/lib/api/leads";
import { ROUTES } from "@/lib/constants";
import { getRepresentativeId } from "@/lib/auth";
import Badge from "@/components/ui/badge";
import StickyScrollbar from "@/components/ui/StickyScrollbar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};



export default function ViewLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [quoteFilter, setQuote]   = useState("All");
  const [page, setPage]           = useState(1);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const representativeId = getRepresentativeId() ?? undefined;
        const data = await getLeads(representativeId);
        setLeads(data || []);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        setLeads([]);
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
      (quoteFilter === "All" || l.quoteStatus === quoteFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const total = leads.length;
  const active = leads.filter((l) => ["Draft", "In Progress", "Quote Generated", "Onboarding Submitted"].includes(l.status)).length;
  const accepted = leads.filter((l) => ["Accepted", "Approved"].includes(l.status)).length;
  const cancelled = leads.filter((l) => ["Cancelled", "Rejected", "Expired"].includes(l.status)).length;

  const statusOptions = ["All", ...Array.from(new Set(leads.map(l => l.status))).filter(Boolean)];
  const quoteOptions = ["All", ...Array.from(new Set(leads.map(l => l.quoteStatus))).filter((s): s is string => Boolean(s))];

  return (
    <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--background)" }}>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
            Leads
          </h1>
          <Button
            onClick={() => router.push(ROUTES.newLead)}
            variant="contained"
            startIcon={<Plus size={20} />}
            sx={{
              bgcolor: "#1FC3EB",
              color: "#0A0A0A",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "none",
              height: "40px",
              px: "16px",
              "&:hover": {
                bgcolor: "#0DB5D8",
              },
            }}
          >
            Add New Lead
          </Button>
        </div>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ marginBottom: "26px" }}>
          {[
            { label: "Total Leads", value: total },
            { label: "Active", value: active },
            { label: "Accepted", value: accepted },
            { label: "Cancelled", value: cancelled },
          ].map(({ label, value }) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
              <Box sx={{
                boxSizing: "border-box",
                background: "var(--card-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                height: "88px",
                padding: "0 23px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "3px",
              }}>
                <Typography sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "var(--text-primary)",
                  margin: 0,
                }}>
                  {value}
                </Typography>
                <Typography sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "17px",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}>
                  {label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Search & Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "26px" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: "480px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by company name or lead ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", padding: "0 12px 0 36px", fontSize: "13px", color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>

          {/* Status Filter */}
          <StatusDropdown
            value={statusFilter}
            onChange={setStatus}
            options={statusOptions}
            placeholder="All Statuses"
          />

          {/* Quote Status Filter */}
          <StatusDropdown
            value={quoteFilter}
            onChange={setQuote}
            options={quoteOptions}
            placeholder="All Quote Statuses"
          />
        </div>

        {/* Table */}
        <Box
          ref={tableRef}
          sx={{
            boxSizing: "border-box",
            background: "var(--card-secondary)",
            border: "0.625px solid var(--border)",
            borderRadius: "10px",
            overflowX: "auto",
            // Hide the native scrollbar
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loading ? (
            <Typography sx={{ padding: "48px", textAlign: "center", color: "#A0A0A0" }}>Loading leads…</Typography>
          ) : filtered.length === 0 ? (
            <Box sx={{ padding: "48px", textAlign: "center" }}>
              <Typography sx={{ color: "#A0A0A0", marginBottom: "16px" }}>No leads found.</Typography>
              <Button
                onClick={() => router.push(ROUTES.newLead)}
                variant="contained"
                sx={{
                  background: "#1FC3EB",
                  color: "#0A0A0A",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: "14px",
                  textTransform: "none",
                  "&:hover": {
                    background: "#0DB5D8",
                  }
                }}
              >
                Create First Lead
              </Button>
            </Box>
          ) : (
            <Box ref={tableRef}>
              <Table>
                {/* Header */}
                <TableHeader>
                  <TableRow>
                    {["Lead ID", "Company Name", "Contact Person", "Employees", "Status", "Quote", "Quote Status", "Created Date", "Actions"].map((h) => (
                      <TableHead key={h}>
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody>
                  {rows.map((lead) => (
                    <TableRow key={lead.leadId}>
                      {/* Lead ID */}
                      <TableCell sx={{ fontFamily: "'Menlo', monospace" }}>
                        {lead.leadReference}
                      </TableCell>

                      {/* Company Name */}
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", m: 0 }}>
                          {lead.employerName}
                        </Typography>
                        {lead.registrationNumber && (
                          <Typography sx={{ fontSize: "12px", color: "var(--text-secondary)", mt: "2px", m: 0 }}>
                            {lead.registrationNumber}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Contact Person */}
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", m: 0 }}>
                          {lead.contactFirstName} {lead.contactLastName}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "var(--text-secondary)", mt: "2px", m: 0 }}>
                          {lead.contactEmail}
                        </Typography>
                      </TableCell>

                      {/* Employees */}
                      <TableCell sx={{ textAlign: "center" }}>
                        {lead.numberOfEmployees.toLocaleString()}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge label={lead.status} type="status" />
                      </TableCell>

                      {/* Quote type */}
                      <TableCell>
                        {lead.quoteStatus && (lead.quoteStatus === "Quick Quote" || lead.quoteStatus === "Full Quote")
                          ? <Badge label={lead.quoteStatus} type="quote" />
                          : <Typography sx={{ color: "#A0A0A0", fontSize: "14px" }}>—</Typography>
                        }
                      </TableCell>

                      {/* Quote Status */}
                      <TableCell>
                        {lead.quoteStatus && lead.quoteStatus !== "Quick Quote" && lead.quoteStatus !== "Full Quote"
                          ? <Badge label={lead.quoteStatus} type="quote" />
                          : <Typography sx={{ color: "#A0A0A0", fontSize: "14px" }}>—</Typography>
                        }
                      </TableCell>

                      {/* Created Date */}
                      <TableCell>
                        {fmt(lead.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Button
                            onClick={() => router.push(`/lead/${lead.leadId}`)}
                            variant="outlined"
                            startIcon={<Eye size={14} />}
                            sx={{
                              padding: "4px 10px",
                              height: "32px",
                              bgcolor: "var(--table-header-bg)",
                              borderColor: "var(--border)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              textTransform: "none",
                              fontSize: "14px",
                              fontWeight: 500,
                              "&:hover": {
                                bgcolor: "var(--border)",
                                borderColor: "var(--border)",
                              }
                            }}
                          >
                            View
                          </Button>
                          {lead.status !== "Cancelled" && lead.status !== "Completed" && (
                            <Button
                              onClick={() => router.push(`/quotes/new?leadId=${lead.leadId}&ref=${lead.leadReference}&company=${encodeURIComponent(lead.employerName)}`)}
                              variant="contained"
                              sx={{
                                padding: "4px 10px",
                                height: "32px",
                                bgcolor: "#1FC3EB",
                                color: "#0A0A0A",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 500,
                                textTransform: "none",
                                "&:hover": {
                                  bgcolor: "#0DB5D8",
                                }
                              }}
                            >
                              Continue
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <Box sx={{
              padding: "12px 16px",
              borderTop: "0.625px solid var(--border)",
              background: "var(--table-header-bg)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <Typography sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--text-secondary)",
              }}>
                Showing {start + 1} to {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                {/* Previous */}
                <Button
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => p - 1)}
                  variant="outlined"
                  startIcon={<ChevronLeft size={14} />}
                  sx={{
                    height: "32px",
                    px: "10px",
                    bgcolor: "transparent",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: safePage === 1 ? "var(--text-muted)" : "var(--text-primary)",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    opacity: safePage === 1 ? 0.5 : 1,
                    "&:hover": {
                      bgcolor: "var(--table-header-bg)",
                      borderColor: "var(--border)",
                    }
                  }}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    onClick={() => setPage(n)}
                    variant={n === safePage ? "contained" : "outlined"}
                    sx={{
                      minWidth: "32px",
                      width: "32px",
                      height: "32px",
                      p: 0,
                      bgcolor: n === safePage ? "#1FC3EB" : "transparent",
                      borderColor: n === safePage ? "none" : "var(--border)",
                      borderRadius: "8px",
                      color: n === safePage ? "#0A0A0A" : "var(--text-primary)",
                      fontSize: "14px",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: n === safePage ? "#0DB5D8" : "var(--table-header-bg)",
                      }
                    }}
                  >
                    {n}
                  </Button>
                ))}

                {/* Next */}
                <Button
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  variant="outlined"
                  endIcon={<ChevronRight size={14} />}
                  sx={{
                    height: "32px",
                    px: "10px",
                    bgcolor: "transparent",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: safePage === totalPages ? "var(--text-muted)" : "var(--text-primary)",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    opacity: safePage === totalPages ? 0.5 : 1,
                    "&:hover": {
                      bgcolor: "var(--table-header-bg)",
                      borderColor: "var(--border)",
                    }
                  }}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          )}
          <StickyScrollbar scrollRef={tableRef} />
        </Box>

      </div>
    </main>
  );
}

function StatusDropdown({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const displayLabel = value === "All" ? placeholder : value;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", color: "var(--foreground)", fontSize: "13px", cursor: "pointer", minWidth: "160px", justifyContent: "space-between" }}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={14} style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: "160px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", zIndex: 50, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {options.map((opt) => (
            <button key={opt} onMouseDown={() => { onChange(opt); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: "13px", color: opt === value ? "var(--primary)" : "var(--foreground)", background: opt === value ? "rgba(31,195,235,0.08)" : "transparent", border: "none", cursor: "pointer" }}>
              {opt === "All" ? placeholder : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
