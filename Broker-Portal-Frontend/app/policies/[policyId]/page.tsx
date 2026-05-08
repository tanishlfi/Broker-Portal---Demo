import DashboardLayout from "@/components/layout/DashboardLayout";
import PolicyDetailPage from "@/features/policies/PolicyDetailPage";
import { Suspense } from "react";

interface Props {
  params: Promise<{ policyId: string }>;
}

export default async function Page({ params }: Props) {
  const { policyId } = await params;
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <PolicyDetailPage policyId={policyId} />
      </Suspense>
    </DashboardLayout>
  );
}
