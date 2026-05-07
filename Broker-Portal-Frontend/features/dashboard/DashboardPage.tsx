"use client";

import {
  Plus,
  ClipboardList,
  FileText,
  Users,
  TriangleAlert,
  CircleDollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import DashboardCard from "@/components/ui/DashboardCard";

const statCards = [
  {
    value: "1000",
    label: "Active Leads",
    icon: Users,
  },
  {
    value: "1000",
    label: "Failed Invoices",
    icon: CircleDollarSign,
  },
  {
    value: "100",
    label: "Active Quotes",
    icon: ClipboardList,
  },
  {
    value: "12",
    label: "Quotes Near Expiry (Today)",
    icon: TriangleAlert,
  },
];

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

  return (
    <main
      className="flex-1 overflow-y-auto p-5"
      style={{ background: "var(--background)" }}
    >
      <h2 className="mb-6 text-2xl font-medium" style={{ color: "#f4f4f5" }}>
        Dashboard
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {statCards.map(({ value, label, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border p-4"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
              borderColor: "rgba(100, 116, 139, 0.24)",
            }}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <p className="text-2xl font-semibold leading-none" style={{ color: "#f7f7f7" }}>
                {value}
              </p>
              <Icon size={16} style={{ color: "#aeb4c0" }} />
            </div>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-6 text-lg font-medium" style={{ color: "#ededed" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ title, description, icon: Icon, href }) => (
            <DashboardCard
              key={title}
              title={title}
              description={description}
              icon={<Icon size={15} />}
              onClick={() => router.push(href)}
              className="rounded-2xl p-4"
              style={{
                background:
                  "linear-gradient(180deg, rgba(48,48,48,0.8) 0%, rgba(42,42,42,0.75) 100%)",
                borderColor: "#30363d",
              }}
              iconWrapperClassName="inline-flex h-7 w-7 items-center justify-center rounded-full"
              iconWrapperStyle={{ background: "rgba(148,163,184,0.14)", color: "#d1d5db", marginBottom: "24px" }}
              titleClassName="mb-2 text-base"
              titleStyle={{ fontSize: "22px", fontWeight: 500, lineHeight: "24px", color: "#f5f5f5" }}
              descriptionStyle={{ fontSize: "12px", color: "#8f96a3", lineHeight: "18px" }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
