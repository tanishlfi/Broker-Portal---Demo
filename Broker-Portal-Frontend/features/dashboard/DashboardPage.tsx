"use client";

import {
  Plus, Eye, Shield, Users,
  Upload, FolderOpen, BarChart2, FileText
} from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

const sections = [
  {
    title: "Lead Management",
    description: "Create and manage insurance leads",
    cols: 2,
    cards: [
      { title: "Start New Lead", description: "Create a new lead and begin the quote journey", icon: <Plus size={28} /> },
      { title: "View Leads", description: "Search, filter and manage existing leads", icon: <Eye size={28} /> },
    ],
  },
  {
    title: "Policy Management",
    description: "View and manage insurance policies",
    cols: 3,
    cards: [
      { title: "My Policies", description: "View and manage your policies", icon: <FileText size={28} /> },
      { title: "All Policies", description: "Browse all active policies", icon: <Users size={28} /> },
      { title: "Policy Approvals", description: "Review and approve pending policies", icon: <Shield size={28} /> },
    ],
  },
  {
    title: "Document Management",
    description: "Upload and manage policy documents",
    cols: 2,
    cards: [
      { title: "File Upload", description: "Upload policy documents and files", icon: <Upload size={28} /> },
      { title: "My Files", description: "Access your uploaded files", icon: <FolderOpen size={28} /> },
    ],
  },
  {
    title: "Reports & Tools",
    description: "Access reports and analytical tools",
    cols: 1,
    cards: [
      { title: "Reports", description: "View performance and activity reports", icon: <BarChart2 size={28} /> },
    ],
  },
];

const colsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <SectionHeader title={section.title} description={section.description} />
          <div className="grid grid-cols-3 gap-4">
            {section.cards.map((card) => (
              <DashboardCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
              />
            ))}
          </div>
          <hr className="border-gray-700 mt-8" />
        </div>
      ))}
    </div>
  );
}
