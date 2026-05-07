"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LeadDetailsPage from "@/features/lead/view/LeadDetailsPage";
import CancelLeadModal from "@/components/lead/CancelLeadModal";
import { ROUTES } from "@/lib/constants";

export default function LeadDetailRoute() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.leadId as string;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelLead = () => {
    // TODO: Call API to cancel the lead
    console.log("Cancelling lead:", leadId);
    // Redirect back to leads list
    router.push(ROUTES.viewLeads);
  };

  const headerAction = (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <button
        onClick={() => setShowCancelModal(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "8px 13px",
          height: "40px",
          background: "#FF6C6C",
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
        Mark as Cancelled
      </button>
      <button
        onClick={() => router.push(`/quotes/new?leadId=${leadId}`)}
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
        New Quote
      </button>
    </div>
  );

  return (
    <>
      <DashboardLayout title="Lead Details" subtitle="" headerAction={headerAction}>
        <div style={{ padding: "24px" }}>
          <LeadDetailsPage leadId={leadId} />
        </div>
      </DashboardLayout>

      <CancelLeadModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelLead}
      />
    </>
  );
}
