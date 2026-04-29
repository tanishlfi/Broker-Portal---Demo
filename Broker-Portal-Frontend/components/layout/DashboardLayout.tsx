"use client";

import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen" style={{ background: "var(--background)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </div>
    </div>
  );
}
