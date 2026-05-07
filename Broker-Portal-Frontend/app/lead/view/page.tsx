"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ViewLeadsPage from "@/features/lead/view/ViewLeadsPage";
import { ROUTES } from "@/lib/constants";

export default function LeadViewRoute() {
  const router = useRouter();

  const headerAction = (
    <button
      onClick={() => router.push(ROUTES.newLead)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "8px 13px",
        height: "40px",
        background: "#1FC3EB",
        color: "#0A0A0A",
        border: "none",
        borderRadius: "8px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: "14px",
        lineHeight: "20px",
        letterSpacing: "-0.150391px",
        cursor: "pointer",
      }}
    >
      <Plus size={24} />
      Add New Lead
    </button>
  );

  return (
    <DashboardLayout title="Leads" subtitle="" headerAction={headerAction}>
      <ViewLeadsPage />
    </DashboardLayout>
  );
}
