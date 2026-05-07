import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/layout/DashboardHeader";
import QuoteJourneyPage from "@/features/lead/quote/QuoteJourneyPage";

interface QuotePageProps {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ 
    ref?: string; 
    company?: string;
    type?: string;
  }>;
}

export default async function QuoteRoute({ params, searchParams }: QuotePageProps) {
  const { leadId } = await params;
  const { ref, company, type } = await searchParams;

  const leadReference = ref || leadId;
  const companyName = company ? decodeURIComponent(company) : "";
  const quoteType = type as "quick" | "full" | undefined;

  return (
    <DashboardLayout>
      <DashboardHeader
        title=""
        showUser={true}
      />

      <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>
        <QuoteJourneyPage 
          leadReference={leadReference} 
          companyName={companyName}
          initialType={quoteType}
        />
      </div>
    </DashboardLayout>
  );
}