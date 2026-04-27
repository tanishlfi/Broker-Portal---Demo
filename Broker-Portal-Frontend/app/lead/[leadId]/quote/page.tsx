import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/layout/DashboardHeader";
import QuoteJourneyPage from "@/features/lead/quote/QuoteJourneyPage";

interface QuotePageProps {
  params: { leadId: string };
  searchParams: { ref?: string; company?: string };
}

export default function QuoteRoute({ params, searchParams }: QuotePageProps) {
  const leadReference = searchParams.ref || params.leadId;
  const companyName = searchParams.company ? decodeURIComponent(searchParams.company) : "";

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Quote Journey"
        subtitle={companyName ? `${companyName} – ${leadReference}` : leadReference}
      />
      <div className="flex-1 flex overflow-hidden">
        <QuoteJourneyPage leadReference={leadReference} companyName={companyName} />
      </div>
    </DashboardLayout>
  );
}
