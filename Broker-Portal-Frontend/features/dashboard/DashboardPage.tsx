"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import {
  Plus,
  ClipboardList,
  FileText,
  Users,
  TriangleAlert,
  CircleDollarSign,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import DashboardCard from "@/components/ui/DashboardCard";
import { getLeads } from "@/lib/api/leads";
import { getRepresentativeId } from "@/lib/auth";

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
        flex: 1,
        overflowY: "auto",
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
          color: "#f4f4f5",
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: "32px" }}>
        {statCards.map(({ value, label, icon: Icon }) => (
          <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={label}>
            <Card
              sx={{
                p: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(100, 116, 139, 0.24)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
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
                    color: "#f7f7f7",
                  }}
                >
                  {value}
                </Typography>
                <Icon size={16} style={{ color: "#aeb4c0" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
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
            color: "#ededed",
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map(({ title, description, icon: Icon, href }) => (
            <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={title}>
              <DashboardCard
                title={title}
                description={description}
                icon={<Icon size={15} />}
                onClick={() => router.push(href)}
                style={{
                  background: "linear-gradient(180deg, rgba(48,48,48,0.8) 0%, rgba(42,42,42,0.75) 100%)",
                  borderColor: "#30363d",
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
                  color: "#d1d5db",
                  marginBottom: "24px",
                }}
                titleStyle={{
                  fontSize: "22px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  color: "#f5f5f5",
                  marginBottom: "8px",
                }}
                descriptionStyle={{
                  fontSize: "12px",
                  color: "#8f96a3",
                  lineHeight: "18px",
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
