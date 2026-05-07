"use client";

import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title = "", subtitle }: DashboardLayoutProps) {
  return (
    <>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-y-auto h-screen"
        style={{ marginLeft: "var(--sidebar-width)", background: "var(--background)", fontFamily: "'Inter', sans-serif" }}
      >
        <DashboardHeader title={title} subtitle={subtitle} showUser={true} />
        {children}
      </div>
    </>
  );
}
