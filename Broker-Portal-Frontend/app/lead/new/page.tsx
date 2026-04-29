import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StartNewLeadPage from "@/features/lead/new/page";

export default function LeadNewRoute() {
  return (
    <DashboardLayout>
      <DashboardHeader title="Start New Lead" />
      <StartNewLeadPage />
    </DashboardLayout>
  );
}
