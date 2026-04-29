"use client";

import {
  Plus, Eye, Shield, Users,
  Upload, FileText, BarChart3, AlertCircle,
  HelpCircle, GraduationCap, MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import DashboardCard from "@/components/ui/DashboardCard";

const sections = [
  {
    title: "Lead Management",
    description: "Create and manage insurance leads",
    cards: [
      { title: "Start New Lead", description: "Create a new lead and begin the quote journey", icon: <Plus size={40} />, href: ROUTES.newLead },
      { title: "View Leads", description: "Search, filter and manage existing leads", icon: <Eye size={40} />, href: "#" },
    ],
  },
  {
    title: "Policy Management",
    description: "View and manage insurance policies",
    cards: [
      { title: "My Policies", description: "View and manage your policies", icon: <FileText size={40} />, href: "#" },
      { title: "All Policies", description: "Browse all active policies", icon: <Users size={40} />, href: "#" },
    ],
  },
  {
    title: "Document Management",
    description: "Upload and manage policy documents",
    cards: [
      { title: "File Upload", description: "Upload policy documents and files", icon: <Upload size={40} />, href: "#" },
      { title: "My Files", description: "Access your uploaded files", icon: <FileText size={40} />, href: "#" },
    ],
  },
  {
    title: "Reports & Tools",
    description: "Analytics and administrative tools",
    cards: [
      { title: "Reports", description: "View analytics and generate reports", icon: <BarChart3 size={40} />, href: "#" },
      { title: "Failed Invoices", description: "Review and retry failed payments", icon: <AlertCircle size={40} />, href: "#" },
    ],
  },
  {
    title: "Support & Resources",
    description: "Get help and access training materials",
    cards: [
      { title: "FAQ", description: "Find answers to common questions", icon: <HelpCircle size={40} />, href: "#" },
      { title: "Training", description: "Access training modules and resources", icon: <GraduationCap size={40} />, href: "#" },
      { title: "Chatbot Support", description: "Get instant help from our AI assistant", icon: <MessageCircle size={40} />, href: "#" },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main
      className="flex-1 overflow-y-auto p-6"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {sections.map((section, i) => (
          <div key={section.title}>
            {/* Section header */}
            <div className="space-y-1 mb-4">
              <h2 style={{ fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5, color: "#1FC3EB" }}>
                {section.title}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.5 }}>
                {section.description}
              </p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.cards.map((card) => (
                <DashboardCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  onClick={card.href !== "#" ? () => router.push(card.href) : undefined}
                />
              ))}
            </div>

            {/* Separator between sections */}
            {i < sections.length - 1 && (
              <div
                className="mt-8"
                style={{ borderTop: "1px solid rgb(58, 58, 58)" }}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
