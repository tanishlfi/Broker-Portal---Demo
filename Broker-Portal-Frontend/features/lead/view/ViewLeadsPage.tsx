"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Plus, Eye, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

import { getLeads, Lead } from "@/lib/api/leads";
import { ROUTES } from "@/lib/constants";
import { getRepresentativeId } from "@/lib/auth";
import Badge from "@/components/ui/badge";
import StickyScrollbar from "@/components/ui/StickyScrollbar";
import MetricCard from "@/components/ui/MetricCard";
import FilterToolbar from "@/components/ui/FilterToolbar";
import MuiTable from "@mui/material/Table";
import MuiTableHead from "@mui/material/TableHead";
import MuiTableBody from "@mui/material/TableBody";
import MuiTableRow from "@mui/material/TableRow";
import MuiTableCell from "@mui/material/TableCell";

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
  const leadMetrics = [
    { label: "Total Leads", value: total },
    { label: "Active", value: active },
    { label: "Accepted", value: accepted },
    { label: "Cancelled", value: cancelled },
  ]

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

        {/* Lead Metric Cards */}
        <Grid container spacing={3} sx={{ marginBottom: "26px" }}>
          {leadMetrics.map(({ label, value }) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
              <MetricCard value={value.toString()} label={label} />
            </Grid>
          ))}
        </Grid>

        {/* Search & Filters */}
        <FilterToolbar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search by company name or lead ID..."
          filters={[
            {
              value: statusFilter,
              onChange: setStatus,
              options: statusOptions,
              placeholder: "All Statuses",
            },
            {
              value: quoteFilter,
              onChange: setQuote,
              options: quoteOptions,
              placeholder: "All Quote Statuses",
            },
          ]}
        />

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
            <MuiTable sx={{ minWidth: 1200 }}>
              {/* Header */}
              <MuiTableHead>
                <MuiTableRow>
                  {["Lead ID", "Company Name", "Contact Person", "Employees", "Status", "Quote", "Quote Status", "Created Date", "Actions"].map((h) => (
                    <MuiTableCell
                      key={h}
                      variant="head"
                      sx={{
                        color: "var(--text-secondary)",
                        padding: h === "Actions" ? "10px 16px 10px 8px" : "10px 8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        borderBottom: "0.625px solid var(--border)",
                        whiteSpace: "nowrap",
                        bgcolor: "var(--card-secondary)",
                        ...(h === "Actions" && { width: "190px", minWidth: "190px" }),
                      }}
                    >
                      {h}
                    </MuiTableCell>
                  ))}
                </MuiTableRow>
              </MuiTableHead>

              {/* Body */}
              <MuiTableBody>
                {rows.map((lead) => (
                  <MuiTableRow
                    key={lead.leadId}
                    sx={{
                      borderBottom: "0.625px solid var(--border)",
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "var(--table-header-bg)" },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    {/* Lead ID */}
                    <MuiTableCell sx={{ padding: "16px 8px", fontSize: "14px", color: "var(--text-primary)", whiteSpace: "nowrap", fontFamily: "'Menlo', monospace", borderBottom: "0.625px solid var(--border)" }}>
                      {lead.leadReference}
                    </MuiTableCell>

                    {/* Company Name */}
                    <MuiTableCell sx={{ padding: "16px 8px", fontSize: "14px", color: "var(--text-primary)", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", m: 0 }}>
                        {lead.employerName}
                      </Typography>
                      {lead.registrationNumber && (
                        <Typography sx={{ fontSize: "12px", color: "var(--text-secondary)", mt: "2px", m: 0 }}>
                          {lead.registrationNumber}
                        </Typography>
                      )}
                    </MuiTableCell>

                    {/* Contact Person */}
                    <MuiTableCell sx={{ padding: "16px 8px", fontSize: "14px", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      <Typography sx={{ fontSize: "14px", color: "var(--text-primary)", m: 0 }}>
                        {lead.contactFirstName} {lead.contactLastName}
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "var(--text-secondary)", mt: "2px", m: 0 }}>
                        {lead.contactEmail}
                      </Typography>
                    </MuiTableCell>

                    {/* Employees */}
                    <MuiTableCell sx={{ padding: "16px 8px", fontSize: "14px", color: "var(--text-primary)", textAlign: "center", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      {lead.numberOfEmployees.toLocaleString()}
                    </MuiTableCell>

                    {/* Status */}
                    <MuiTableCell sx={{ padding: "16px 8px", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      <Badge label={lead.status} type="status" />
                    </MuiTableCell>

                    {/* Quote type */}
                    <MuiTableCell sx={{ padding: "16px 8px", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      {lead.quoteStatus && (lead.quoteStatus === "Quick Quote" || lead.quoteStatus === "Full Quote")
                        ? <Badge label={lead.quoteStatus} type="quote" />
                        : <Typography sx={{ color: "#A0A0A0", fontSize: "14px" }}>—</Typography>
                      }
                    </MuiTableCell>

                    {/* Quote Status */}
                    <MuiTableCell sx={{ padding: "16px 8px", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      {lead.quoteStatus && lead.quoteStatus !== "Quick Quote" && lead.quoteStatus !== "Full Quote"
                        ? <Badge label={lead.quoteStatus} type="quote" />
                        : <Typography sx={{ color: "#A0A0A0", fontSize: "14px" }}>—</Typography>
                      }
                    </MuiTableCell>

                    {/* Created Date */}
                    <MuiTableCell sx={{ padding: "16px 8px", fontSize: "14px", color: "var(--text-primary)", whiteSpace: "nowrap", borderBottom: "0.625px solid var(--border)" }}>
                      {fmt(lead.createdAt)}
                    </MuiTableCell>

                    {/* Actions */}
                    <MuiTableCell
                      sx={{
                        padding: "16px 16px 16px 8px",
                        whiteSpace: "nowrap",
                        borderBottom: "0.625px solid var(--border)",
                        width: "190px",
                        minWidth: "190px",
                      }}
                    >
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
                    </MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <Box sx={{
              borderTop: "0.625px solid var(--border)",
              background: "var(--table-header-bg)",
              minWidth: "1200px",
              width: "100%",
            }}>
              <Box sx={{
                padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                minWidth: "1200px",
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
            </Box>
          )}
        </Box>

        <StickyScrollbar scrollRef={tableRef} />

      </div>
    </main>
  );
}

