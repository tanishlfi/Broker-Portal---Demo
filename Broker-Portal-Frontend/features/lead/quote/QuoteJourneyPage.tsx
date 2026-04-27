"use client";

interface QuoteJourneyPageProps {
  leadReference: string;
  companyName: string;
}

export default function QuoteJourneyPage({
  leadReference,
  companyName,
}: QuoteJourneyPageProps) {
  return (
    <div className="flex justify-center items-start min-h-screen bg-[#1f1f1f] px-6 pt-12 w-full">
      
      {/* Main Card */}
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-10 py-8 w-full max-w-[720px] shadow-md">
        
        {/* Header */}
        <h2 className="text-white text-sm font-semibold mb-1">
          Select Quote Type
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          Choose the type of quote you'd like to generate for this lead.
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-5">
          
          {/* Quick Quote */}
          <button className="group text-left bg-[#303030] border border-[#444] hover:border-[#29abe2] rounded-lg p-5 transition-all duration-200 hover:shadow-[0_0_0_1px_#29abe2]">
            
            <h3 className="text-white text-sm font-semibold mb-2">
              Quick Quote
            </h3>

            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Generate an indicative quote with estimated pricing based on employee count
            </p>

            <ul className="space-y-1">
              {[
                "Fast generation",
                "Indicative pricing",
                "No employee data required",
                "Can upgrade to full quote",
              ].map((item) => (
                <li
                  key={item}
                  className="text-gray-400 text-xs flex gap-2"
                >
                  <span className="text-gray-500">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </button>

          {/* Full Quote */}
          <button className="group text-left bg-[#303030] border border-[#444] hover:border-[#29abe2] rounded-lg p-5 transition-all duration-200 hover:shadow-[0_0_0_1px_#29abe2]">
            
            <h3 className="text-white text-sm font-semibold mb-2">
              Full Quote
            </h3>

            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Generate a comprehensive quote with detailed employee data and accurate pricing
            </p>

            <ul className="space-y-1">
              {[
                "Comprehensive coverage details",
                "Accurate pricing",
                "Employee data upload required",
                "Ready for employer approval",
              ].map((item) => (
                <li
                  key={item}
                  className="text-gray-400 text-xs flex gap-2"
                >
                  <span className="text-gray-500">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </button>

        </div>
      </div>
    </div>
  );
}