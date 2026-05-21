"use client";

import { useState } from "react";
import { Play, BookOpen, FileText, GraduationCap } from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: "video" | "interactive" | "document";
  duration: string;
  status: "review" | "start";
  isCompleted?: boolean;
}

const trainingModules: TrainingModule[] = [
  {
    id: "1",
    title: "Getting Started with Broker Portal",
    description: "Learn the basics of navigating the portal and understanding key features",
    type: "video",
    duration: "15 minutes",
    status: "review",
  },
  {
    id: "2",
    title: "Creating and Managing Leads",
    description: "Step-by-step guide to creating new leads, capturing employer information",
    type: "interactive",
    duration: "20 minutes",
    status: "review",
  },
  {
    id: "3",
    title: "Quote Generation: Quick vs Full Quote",
    description: "Understanding the difference between quote types and when to use each",
    type: "video",
    duration: "25 minutes",
    status: "start",
  },
  {
    id: "4",
    title: "Employee Data Upload Requirements",
    description: "Learn about required data fields, file formats, and validation rules",
    type: "document",
    duration: "12 minutes",
    status: "start",
  },
  {
    id: "5",
    title: "Quote Customization and Pricing",
    description: "How to customize quotes, adjust coverage, and understand pricing models",
    type: "video",
    duration: "15 minutes",
    status: "start",
  },
  {
    id: "6",
    title: "OTP Acceptance and Employer Communication",
    description: "Best practices for sending quotes to employers and managing OTP verification",
    type: "interactive",
    duration: "22 minutes",
    status: "start",
  },
  {
    id: "7",
    title: "Onboarding Process: AML, VOPD, and Validation",
    description: "Understanding verification stages and what happens during onboarding",
    type: "interactive",
    duration: "18 minutes",
    status: "start",
  },
  {
    id: "8",
    title: "Policy Management and Document Downloads",
    description: "How to view policies, download documents, and manage policy information",
    type: "document",
    duration: "14 minutes",
    status: "start",
  },
  {
    id: "9",
    title: "Handling Failed Invoice Payments",
    description: "Troubleshooting payment failures and communication strategies",
    type: "interactive",
    duration: "30 minutes",
    status: "start",
  },
  {
    id: "10",
    title: "Compliance and Regulatory Requirements",
    description: "Understanding your obligations under insurance regulations",
    type: "video",
    duration: "20 minutes",
    status: "start",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play size={12} />;
    case "interactive":
      return <GraduationCap size={12} />;
    case "document":
      return <FileText size={12} />;
    default:
      return <BookOpen size={12} />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "video":
      return "Video";
    case "interactive":
      return "Interactive";
    case "document":
      return "Document";
    default:
      return "Module";
  }
};

export default function TrainingPage() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);

  return (
    <main
      className="flex-1 p-5 min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
          Training
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Complete training modules to master the Broker Portal
        </p>
      </div>

      {/* Training Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainingModules.map((module) => (
          <div
            key={module.id}
            className="rounded-lg overflow-hidden transition-all hover:shadow-lg"
            style={{
              background: "var(--card-secondary)",
              border: "0.625px solid var(--border)",
            }}
          >
            {/* Card Content */}
            <div className="p-6">
              {/* Header with Type Badge */}
              <div className="flex items-start gap-2 mb-4">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: "var(--table-header-bg)",
                    border: "0.625px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  {getTypeIcon(module.type)}
                  <span>{getTypeLabel(module.type)}</span>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: "var(--table-header-bg)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span>{module.duration}</span>
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-base font-medium mb-2"
                style={{ color: module.status === "start" ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {module.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm mb-6 line-clamp-2"
                style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}
              >
                {module.description}
              </p>

              {/* Button */}
              <button
                onClick={() => setSelectedModule(module)}
                className="w-full py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: module.status === "start" ? "#1FC3EB" : "var(--table-header-bg)",
                  color: module.status === "start" ? "#FFFFFF" : "var(--text-primary)",
                  border: module.status === "start" ? "none" : "0.625px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  if (module.status === "start") {
                    e.currentTarget.style.background = "#0099B8";
                  } else {
                    e.currentTarget.style.background = "var(--border)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (module.status === "start") {
                    e.currentTarget.style.background = "#1FC3EB";
                  } else {
                    e.currentTarget.style.background = "var(--table-header-bg)";
                  }
                }}
              >
                {module.status === "start" ? "Start Module" : "Review Module"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <TrainingModuleModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </main>
  );
}

interface TrainingModuleModalProps {
  module: TrainingModule;
  onClose: () => void;
}

function TrainingModuleModal({ module, onClose }: TrainingModuleModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(11, 11, 11, 0.72)",
        backdropFilter: "blur(10.5px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg overflow-hidden"
        style={{
          background: "var(--card-secondary)",
          border: "0.625px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 border-b"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div>
            <h2 className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              {module.title}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              {module.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {/* Module Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              className="p-4 rounded-lg"
              style={{
                background: "var(--table-header-bg)",
                border: "0.625px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-medium mb-2 uppercase"
                style={{ color: "var(--text-secondary)", letterSpacing: "0.3px" }}
              >
                Module Type
              </p>
              <p style={{ color: "var(--text-primary)" }}>
                {getTypeLabel(module.type)}
              </p>
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                background: "var(--table-header-bg)",
                border: "0.625px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-medium mb-2 uppercase"
                style={{ color: "var(--text-secondary)", letterSpacing: "0.3px" }}
              >
                Duration
              </p>
              <p style={{ color: "var(--text-primary)" }}>
                {module.duration}
              </p>
            </div>
          </div>

          {/* Description */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              background: "var(--table-header-bg)",
              border: "0.625px solid var(--border)",
            }}
          >
            <p
              className="text-xs font-medium mb-2 uppercase"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.3px" }}
            >
              About This Module
            </p>
            <p style={{ color: "var(--text-primary)", lineHeight: "1.6" }}>
              {module.description}
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="mb-6">
            <h3
              className="text-sm font-medium mb-4 uppercase"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.2px" }}
            >
              What You'll Learn
            </h3>
            <ul className="space-y-2">
              {[
                "Core concepts and best practices",
                "Step-by-step workflows and processes",
                "Common scenarios and troubleshooting",
                "Tips for maximizing efficiency",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{
                    background: "var(--table-header-bg)",
                    border: "0.625px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      color: "#1FC3EB",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-6 border-t"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: "var(--table-header-bg)",
              border: "0.625px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--table-header-bg)";
            }}
          >
            Close
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
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
            {module.status === "start" ? "Start Module" : "Review Module"}
          </button>
        </div>
      </div>
    </div>
  );
}
