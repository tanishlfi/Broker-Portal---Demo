"use client";

import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditLeadPage from "@/features/lead/edit/EditLeadPage";

export default function EditLeadRoute() {
  const params = useParams();
  const leadId = params.leadId as string;

  return (
    <DashboardLayout title="">
      <div style={{ padding: "24px" }}>
        <EditLeadPage leadId={leadId} />
      </div>
    </DashboardLayout>
  );
}
