import { Suspense } from "react";
import QuoteDetailsPage from "@/features/quotes/QuoteDetailsPage";

export default function QuoteDetailsRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuoteDetailsPage />
    </Suspense>
  );
}
