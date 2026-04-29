import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/layout/DashboardHeader";
import QuoteJourneyPage from "@/features/lead/quote/QuoteJourneyPage";

interface QuotePageProps {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ 
    ref?: string; 
    company?: string; 
  }>;
}

export default async function QuoteRoute({ params, searchParams }: QuotePageProps) {
  const { leadId } = await params;
  const { ref, company } = await searchParams;

  const leadReference = ref || leadId;
  const companyName = company ? decodeURIComponent(company) : "";

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Quote Journey"
        subtitle={companyName ? `${companyName} – ${leadReference}` : leadReference}
      />

      <div className="flex-1 flex justify-center pt-10 px-6 pb-10">
        {/* ✅ ONLY ONE ENTRY POINT */}
        <QuoteJourneyPage 
          leadReference={leadReference} 
          companyName={companyName} 
        />
      </div>
    </DashboardLayout>
  );
}