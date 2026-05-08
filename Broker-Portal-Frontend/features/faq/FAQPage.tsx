"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "How do I start a new lead?",
    answer: "To start a new lead, navigate to the 'Leads' section and click 'Create New Lead'. You'll need to enter the employer information, contact details, and number of employees. Our system will guide you through each step of the process.",
  },
  {
    id: "2",
    question: "What is the difference between Quick Quote and Full Quote?",
    answer: "A Quick Quote provides indicative pricing based on basic information and can be generated in minutes. A Full Quote requires detailed employee data and provides comprehensive coverage options with accurate pricing. Choose Quick Quote for initial estimates and Full Quote for detailed proposals.",
  },
  {
    id: "3",
    question: "How do I upload employee data for a Full Quote?",
    answer: "You can upload employee data using our CSV template. Download the template from the portal, fill in the required fields (employee names, ages, salaries), and upload it back. Our system will validate the data and generate a Full Quote based on the information provided.",
  },
  {
    id: "4",
    question: "Can I customize a quote after generation?",
    answer: "Yes, you can customize quotes after generation. You can adjust coverage levels, add or remove benefits, and modify pricing. All changes are reflected in real-time, and you can download the updated quote document.",
  },
  {
    id: "5",
    question: "How does the OTP acceptance process work?",
    answer: "After sending a quote to an employer, they receive an OTP (One-Time Password) via email or SMS. They enter this OTP to verify and accept the quote. Once accepted, the quote moves to the onboarding stage.",
  },
  {
    id: "6",
    question: "What happens during the onboarding process?",
    answer: "The onboarding process includes AML (Anti-Money Laundering) verification, VOPD (Verification of Personal Details), and validation checks. This ensures compliance with regulatory requirements and verifies all information before policy activation.",
  },
  {
    id: "7",
    question: "How can I view my existing leads?",
    answer: "Go to the 'Leads' section to view all your existing leads. You can filter by status (Draft, In Progress, Completed), search by company name, and view detailed information about each lead including quotes and policies.",
  },
  {
    id: "8",
    question: "What do I do if an invoice payment fails?",
    answer: "If a payment fails, check the 'Failed Invoices' section in Tools & Support. You'll see the reason for failure and can retry the payment. Common reasons include insufficient funds or technical issues. Contact support if the issue persists.",
  },
  {
    id: "9",
    question: "How do I download a quote document?",
    answer: "Navigate to the quote you want to download and click the 'Download' button. The quote will be generated as a PDF document with all details including coverage, pricing, and terms. You can then share it with the employer.",
  },
  {
    id: "10",
    question: "Can I cancel a lead after creating it?",
    answer: "Yes, you can cancel a lead at any time before it reaches the active policy stage. Go to the lead details and click 'Cancel Lead'. The lead will be marked as cancelled and you can create a new one if needed.",
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main
      className="flex-1 overflow-y-auto p-5 min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2" style={{ color: "#FFFFFF" }}>
          FAQ's
        </h1>
        <p style={{ color: "#A0A0A0", fontSize: "14px" }}>
          Find answers to common questions about the Broker Portal
        </p>
      </div>

      {/* FAQ Container */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "#1E1E1E",
          border: "0.625px solid #4A4A4A",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-6"
          style={{
            background: "#1E1E1E",
            borderBottom: "0.625px solid #4A4A4A",
          }}
        >
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: "24px",
              height: "24px",
              color: "#1FC3EB",
            }}
          >
            <HelpCircle size={24} />
          </div>
          <h2 className="text-lg font-medium" style={{ color: "#FFFFFF" }}>
            Common Questions
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-0">
          {faqItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                background: "#1E1E1E",
                borderBottom: index < faqItems.length - 1 ? "0.625px solid #4A4A4A" : "none",
              }}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-center justify-between p-4 transition-colors hover:bg-opacity-80"
                style={{
                  background: expandedId === item.id ? "rgba(58, 58, 58, 0.5)" : "#262626",
                  border: "0.625px solid #333333",
                  borderRadius: expandedId === item.id ? "10px 10px 0 0" : "10px",
                  margin: "12px",
                  marginBottom: expandedId === item.id ? "0" : "12px",
                }}
              >
                <span
                  className="text-sm font-medium text-left"
                  style={{ color: "#FFFFFF" }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  size={16}
                  style={{
                    color: "#A0A0A0",
                    transform: expandedId === item.id ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    flexShrink: 0,
                    marginLeft: "12px",
                  }}
                />
              </button>

              {/* Answer */}
              {expandedId === item.id && (
                <div
                  className="px-4 py-4"
                  style={{
                    background: "rgba(58, 58, 58, 0.5)",
                    borderTop: "0.625px solid #4A4A4A",
                    borderRadius: "0 0 10px 10px",
                    margin: "0 12px 12px 12px",
                  }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#A0A0A0", lineHeight: "1.6" }}
                  >
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 p-6 rounded-lg" style={{ background: "rgba(31, 195, 235, 0.1)", border: "0.625px solid rgba(31, 195, 235, 0.2)" }}>
        <h3 className="text-base font-medium mb-2" style={{ color: "#1FC3EB" }}>
          Didn't find what you're looking for?
        </h3>
        <p style={{ color: "#A0A0A0", fontSize: "14px", marginBottom: "12px" }}>
          Our support team is here to help. You can reach out through the Chatbot or contact support directly.
        </p>
        <button
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: "#1FC3EB",
            color: "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#0099B8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1FC3EB";
          }}
        >
          Contact Support
        </button>
      </div>
    </main>
  );
}
