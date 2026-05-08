import DashboardLayout from "@/components/layout/DashboardLayout";
import PoliciesPage from "@/features/policies/PoliciesPage";

export default function Page() {
  return (
    <DashboardLayout>
      <PoliciesPage />
    </DashboardLayout>
  );
}
