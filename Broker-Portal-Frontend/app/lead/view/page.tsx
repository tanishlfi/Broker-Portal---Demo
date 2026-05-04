import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ViewLeadsPage from "@/features/lead/view/ViewLeadsPage";

export default function LeadViewRoute() {
  return (
    <DashboardLayout>
      <DashboardHeader
        title="View Leads"
        subtitle="Search, filter, and manage your insurance leads"
      />
      <ViewLeadsPage />
    </DashboardLayout>
  );
}
