import DashboardLayout from "@/components/layout/DashboardLayout";
import StartNewLeadPage from "@/features/lead/new/page";

export default function LeadNewRoute() {
  return (
    <DashboardLayout title="">
      <StartNewLeadPage />
    </DashboardLayout>
  );
}
