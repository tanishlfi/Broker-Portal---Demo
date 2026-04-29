import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardPage from "@/features/dashboard/DashboardPage";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader
        title="Broker Portal Dashboard"
        subtitle="Welcome back, manage your leads and policies"
        showUser={false}
      />
      <DashboardPage />
    </DashboardLayout>
  );
}
