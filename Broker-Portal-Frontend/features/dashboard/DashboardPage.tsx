"use client";

import {
  Plus, Eye, Shield, Users,
  Upload, FolderOpen, BarChart2, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { ROUTES } from "@/lib/constants";

const sections = [
  {
    title: "Lead Management",
    description: "Create and manage insurance leads",
    cards: [
      { title: "Start New Lead", description: "Create a new lead and begin the quote journey", icon: <Plus size={28} />, href: ROUTES.newLead },
      { title: "View Leads", description: "Search, filter and manage existing leads", icon: <Eye size={28} />, href: "#" },
    ],
  },
  {
    title: "Policy Management",
    description: "View and manage insurance policies",
    cards: [
      { title: "My Policies", description: "View and manage your policies", icon: <FileText size={28} />, href: "#" },
      { title: "All Policies", description: "Browse all active policies", icon: <Users size={28} />, href: "#" },
      { title: "Policy Approvals", description: "Review and approve pending policies", icon: <Shield size={28} />, href: "#" },
    ],
  },
  {
    title: "Document Management",
    description: "Upload and manage policy documents",
    cards: [
      { title: "File Upload", description: "Upload policy documents and files", icon: <Upload size={28} />, href: "#" },
      { title: "My Files", description: "Access your uploaded files", icon: <FolderOpen size={28} />, href: "#" },
    ],
  },
  {
    title: "Reports & Tools",
    description: "Access reports and analytical tools",
    cards: [
      { title: "Reports", description: "View performance and activity reports", icon: <BarChart2 size={28} />, href: "#" },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
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
                onClick={() => card.href !== "#" && router.push(card.href)}
              />
            ))}
          </div>
          <hr className="border-gray-700 mt-8 hidden" />
        </div>
      ))}
    </div>
  );
}
