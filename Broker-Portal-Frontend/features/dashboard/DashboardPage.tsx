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
import MetricCard from "@/components/ui/MetricCard";
import { getDashboardMetrics } from "@/lib/api/dashboard";

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
  const [metrics, setMetrics] = useState({
    activeLeads: 0,
    failedInvoices: 0,
    activeQuotes: 0,
    quotesNearExpiry: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const metricsData = await getDashboardMetrics();
        setMetrics({
          activeLeads: metricsData.activeLeads,
          failedInvoices: metricsData.failedInvoices,
          activeQuotes: metricsData.activeQuotes,
          quotesNearExpiry: metricsData.quotesExpiredToday,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard Metrics", err);
        setMetrics({
          activeLeads: 0,
          failedInvoices: 0,
          activeQuotes: 0,
          quotesNearExpiry: 0,
        });
      }
    })();
  }, []);

  const metricCards = [
    {
      value: metrics.activeLeads.toString(),
      label: "Active Leads",
      icon: Users,
    },
    {
      value: metrics.failedInvoices.toString(),
      label: "Failed Invoices",
      icon: CircleDollarSign,
    },
    {
      value: metrics.activeQuotes.toString(),
      label: "Active Quotes",
      icon: ClipboardList,
    },
    {
      value: metrics.quotesNearExpiry.toString(),
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
          {metricCards.map(({ value, label, icon }) => (
            <Grid size={3} key={label}>
              <MetricCard value={value} label={label} icon={icon} />
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
                  iconWrapperStyle={{
                    height: "28px",
                    width: "28px",
                    backgroundColor: "rgba(148,163,184,0.14)",
                    color: "var(--text-primary)",
                    marginBottom: "24px",
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
