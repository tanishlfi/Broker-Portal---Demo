import React from "react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function DashboardCard({ title, description, icon, onClick }: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg p-6 flex flex-col h-full w-full group"
      style={{
        background: "#2d2d2d",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgb(58, 58, 58)",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#1FC3EB";
        el.style.background = "rgba(31, 195, 235, 0.05)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgb(58, 58, 58)";
        el.style.background = "#2d2d2d";
      }}
    >
      <div
        className="mb-4 transition-transform group-hover:scale-110"
        style={{ color: "#1FC3EB" }} // text-primary dark mode
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.5, color: "#ffffff" }} className="mb-2">{title}</h3>
      <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.5 }} className="flex-1">
        {description}
      </p>
    </button>
  );
}
