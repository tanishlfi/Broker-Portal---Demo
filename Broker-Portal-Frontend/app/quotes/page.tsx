import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuotesPage from "@/features/quotes/QuotesPage";

export default function Quotes() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <QuotesPage />
      </Suspense>
    </DashboardLayout>
  );
}
