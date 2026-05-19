"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { Plus, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

import { getLeads, cancelLead, Lead } from "@/lib/api/leads";
import { ROUTES } from "@/lib/constants";
import { getRepresentativeId } from "@/lib/auth";
import Badge from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { LeadStatus } from "@/lib/enums";

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
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100vh - 120px)",
        background: "rgba(24, 24, 24, 0.8)",
        border: "1px solid rgba(29, 51, 68, 0.4)",
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background blur */}
      <Box
        sx={{
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
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Typography variant="h1" sx={{ fontSize: "22px", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
            Leads
          </Typography>
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
        </Box>

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
                <Typography sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  color: "#E6E6E6",
                  margin: 0,
                }}>
                  {value}
                </Typography>
                <Typography sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "17px",
                  color: "#C5C5C5",
                  margin: 0,
                }}>
                  {label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Search & Filters */}
        <Grid container spacing={2} sx={{ marginBottom: "26px", alignItems: "center" }}>
          {/* Search */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by company name or lead ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#A0A0A0" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                  bgcolor: "#262626",
                }
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={statusFilter}
                onChange={(e) => setStatus(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Status Filter" }}
                sx={{
                  height: "40px",
                  bgcolor: "#262626",
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                {statusOptions.filter(opt => opt !== "All").map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Quote Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={quoteFilter}
                onChange={(e) => setQuote(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Quote Status Filter" }}
                sx={{
                  height: "40px",
                  bgcolor: "#262626",
                }}
              >
                <MenuItem value="All">All Quote Statuses</MenuItem>
                {quoteOptions.filter(opt => opt !== "All").map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Table */}
        <Box sx={{
          boxSizing: "border-box",
          background: "#2D2D2D",
          border: "0.625px solid #4A4A4A",
          borderRadius: "10px",
          overflow: "hidden",
        }}>
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
            <Box sx={{ overflowX: "auto" }}>
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
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#FFFFFF", m: 0 }}>
                          {lead.employerName}
                        </Typography>
                        {lead.registrationNumber && (
                          <Typography sx={{ fontSize: "12px", color: "#A0A0A0", mt: "2px", m: 0 }}>
                            {lead.registrationNumber}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Contact Person */}
                      <TableCell>
                        <Typography sx={{ fontSize: "14px", color: "#FFFFFF", m: 0 }}>
                          {lead.contactFirstName} {lead.contactLastName}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#A0A0A0", mt: "2px", m: 0 }}>
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
                              bgcolor: "rgba(58,58,58,0.5)",
                              borderColor: "#4A4A4A",
                              borderRadius: "8px",
                              color: "#FFFFFF",
                              textTransform: "none",
                              fontSize: "14px",
                              fontWeight: 500,
                              "&:hover": {
                                bgcolor: "rgba(80,80,80,0.5)",
                                borderColor: "#666666",
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
              borderTop: "0.625px solid #4A4A4A",
              background: "rgba(58,58,58,0.3)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <Typography sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#A0A0A0",
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
                    borderColor: "#4A4A4A",
                    borderRadius: "8px",
                    color: safePage === 1 ? "#4A4A4A" : "#FFFFFF",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    opacity: safePage === 1 ? 0.5 : 1,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderColor: "#666666",
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
                      borderColor: n === safePage ? "none" : "#4A4A4A",
                      borderRadius: "8px",
                      color: n === safePage ? "#0A0A0A" : "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: n === safePage ? "#0DB5D8" : "rgba(255,255,255,0.05)",
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
                    borderColor: "#4A4A4A",
                    borderRadius: "8px",
                    color: safePage === totalPages ? "#4A4A4A" : "#FFFFFF",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    opacity: safePage === totalPages ? 0.5 : 1,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderColor: "#666666",
                    }
                  }}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

      </Box>
    </Paper>
  );
}