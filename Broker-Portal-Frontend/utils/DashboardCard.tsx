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
      className="bg-[#2a2a2a] hover:bg-[#313131] rounded-xl p-5 flex flex-col gap-6 text-left transition-colors w-full h-36"
    >
      <div className="text-[#29abe2]">{icon}</div>
      <div>
        <p className="text-white text-sm font-semibold mb-1">{title}</p>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
