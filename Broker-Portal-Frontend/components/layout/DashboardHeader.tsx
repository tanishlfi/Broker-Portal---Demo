"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userEmail?: string;
}

export default function DashboardHeader({ title, subtitle, userEmail }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-8 h-16 border-b border-gray-700 bg-[#1e1e1e] flex-shrink-0">
      <div>
        <h1 className="text-white text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-gray-400 text-xs">
            Current User: <span className="text-gray-300">{userEmail}</span>
          </span>
        )}
        <button className="text-gray-400 hover:text-white transition-colors" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button
          onClick={() => router.push(ROUTES.login)}
          className="text-xs text-gray-400 hover:text-white uppercase tracking-widest transition-colors font-semibold"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
