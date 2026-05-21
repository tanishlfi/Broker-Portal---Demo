"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  Plus,
  ClipboardList,
  FileText,
  Users,
  TriangleAlert,
  CircleDollarSign,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getLeads } from "@/lib/api/leads";
import { getRepresentativeId } from "@/lib/auth";
import DashboardCard from "@/components/ui/DashboardCard";

const quickActions = [
  {
    title: "Start New Lead",
    description: "Create new lead and begin the quote journey",
    icon: Plus,
    href: ROUTES.newLead,
  },
  {
    title: "View All Leads",
    description: "Search, filter and manage existing leads",
    icon: ClipboardList,
    href: ROUTES.viewLeads,
  },
  {
    title: "View Quotes",
    description: "Manage and track insurance quotes",
    icon: FileText,
    href: ROUTES.quotes,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    activeLeads: 0,
    failedInvoices: 0,
    activeQuotes: 0,
    quotesNearExpiry: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const representativeId = getRepresentativeId() ?? undefined;
        const leads = await getLeads(representativeId);
        
        const activeLeads = leads.filter((l) => 
          ["Draft", "In Progress", "Quote Generated", "Awaiting Employer Acceptance", "Accepted", "Onboarding Submitted", "Pending Approval"].includes(l.status)
        ).length;
        
        const allQuotes = leads.flatMap(l => l.quotes || []);
        const activeQuotes = allQuotes.filter(q => 
          !["Expired", "Cancelled", "Rejected"].includes(q.quoteStatus)
        ).length;
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const now = new Date();

        const quotesNearExpiry = allQuotes.filter(q => {
          if (!q.expiryDate) return false;
          const expiry = new Date(q.expiryDate);
          return expiry > now && expiry <= sevenDaysFromNow;
        }).length;

        setStats({
          activeLeads,
          failedInvoices: 0,
          activeQuotes,
          quotesNearExpiry,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        // Set default stats on error
        setStats({
          activeLeads: 0,
          failedInvoices: 0,
          activeQuotes: 0,
          quotesNearExpiry: 0,
        });
      }
    })();
  }, []);

  const statCards = [
    {
      value: stats.activeLeads.toString(),
      label: "Active Leads",
      icon: Users,
    },
    {
      value: stats.failedInvoices.toString(),
      label: "Failed Invoices",
      icon: CircleDollarSign,
    },
    {
      value: stats.activeQuotes.toString(),
      label: "Active Quotes",
      icon: ClipboardList,
    },
    {
      value: stats.quotesNearExpiry.toString(),
      label: "Quotes Near Expiry (Today)",
      icon: TriangleAlert,
    },
  ];

  return (
    <Box
      component="main"
      sx={{
        p: "20px",
        bgcolor: "var(--background)",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: "24px",
          fontSize: "1.5rem",
          fontWeight: 500,
          color: "var(--text-primary)",
        }}
      >
        Dashboard
      </Typography>

      <Box sx={{ maxWidth: "100%" }}>
        <Grid container spacing={3} sx={{ mb: "32px" }}>
          {statCards.map(({ value, label, icon: Icon }) => (
            <Grid size={3} key={label}>
              <Card
                sx={{
                  p: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--card-secondary)",
                  boxShadow: "none",
                }}
              >
                <Box
                  sx={{
                    mb: "4px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      lineHeight: 1,
                      color: "var(--text-primary)",
                    }}
                  >
                    {value}
                  </Typography>
                  <Icon size={16} style={{ color: "var(--text-secondary)" }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Typography
            variant="h3"
            sx={{
              mb: "24px",
              fontSize: "1.125rem",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map(({ title, description, icon: Icon, href }) => (
              <Grid size={4} key={title}>
                <DashboardCard
                  title={title}
                  description={description}
                  icon={<Icon size={15} />}
                  onClick={() => router.push(href)}
                  style={{
                    background: "var(--card-secondary)",
                    borderColor: "var(--border)",
                    borderRadius: "16px",
                  }}
                  iconWrapperStyle={{
                    display: "inline-flex",
                    height: "28px",
                    width: "28px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    backgroundColor: "rgba(148,163,184,0.14)",
                    color: "var(--text-primary)",
                    marginBottom: "24px",
                  }}
                  titleStyle={{
                    fontSize: "22px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                  descriptionStyle={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    lineHeight: "18px",
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
