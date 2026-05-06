import DashboardLayout from "@/components/layout/DashboardLayout";
import QuoteTypeSelection from "@/features/quotes/QuoteTypeSelection";

export default function NewQuote() {
  return (
    <DashboardLayout>
      <QuoteTypeSelection />
    </DashboardLayout>
  );
}
