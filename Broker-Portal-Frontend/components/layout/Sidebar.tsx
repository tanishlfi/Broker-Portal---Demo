"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus, Eye, FileText, Shield,
  AlertCircle, HelpCircle, GraduationCap,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useUser } from "@/lib/context/UserContext";

const quickActions = [
  { label: "Start New Lead", icon: Plus, href: ROUTES.newLead },
  { label: "View Leads", icon: Eye, href: "#" },
  { label: "Quotes", icon: FileText, href: "#" },
  { label: "My Policies", icon: Shield, href: "#" },
];

const toolsSupport = [
  { label: "Failed Invoices", icon: AlertCircle, href: "#" },
  { label: "FAQ", icon: HelpCircle, href: "#" },
  { label: "Training", icon: GraduationCap, href: "#" },
];

interface SidebarProps {
  userEmail?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ userEmail: propEmail, collapsed: collapsedProp, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(propEmail ?? "");
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const collapsed = collapsedProp !== undefined ? collapsedProp : internalCollapsed;
  const handleToggle = onToggle ?? (() => setInternalCollapsed((v) => !v));

  // Safely use useUser with try-catch for SSR
  let user = null;
  try {
    const userContext = useUser();
    user = userContext?.user;
  } catch (error) {
    // Context not available during SSR, will use localStorage
  }

  useEffect(() => {
    setMounted(true);
    // Use user from context first, then prop, then localStorage
    if (user?.email) {
      setUserEmail(user.email);
    } else if (propEmail) {
      setUserEmail(propEmail);
    } else {
      setUserEmail(localStorage.getItem("userEmail") ?? "");
    }
  }, [user, propEmail]);

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-44"} h-screen bg-[#1a1a1a] flex flex-col border-r border-[#2a2a2a] flex-shrink-0 transition-all duration-300 fixed left-0 top-0 z-10`}
    >
      {/* Logo + collapse toggle inline */}
      <div className={`flex items-center justify-between h-16 border-b border-[#2a2a2a] flex-shrink-0 px-4`}>
        {!collapsed && <span className="text-[#29abe2] font-black italic text-2xl tracking-tight leading-none">RMA</span>}
        <button
          onClick={handleToggle}
          aria-label="Toggle sidebar"
          className={`text-gray-400 hover:text-white transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <div className={`flex-1 overflow-y-auto py-5 ${collapsed ? "px-2" : "px-4"}`}>
        {/* Quick Actions */}
        <div className="mb-6">
          {!collapsed && (
            <p className="text-gray-500 text-[9px] uppercase tracking-[0.15em] mb-2 px-2">Quick Actions</p>
          )}
          <nav className="flex flex-col gap-0.5">
            {quickActions.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href;
              return (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-2.5 text-[11px] py-2 px-2 rounded transition-colors text-left w-full ${
                    isActive
                      ? "bg-[#29abe2] text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {!collapsed && label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tools & Support */}
        <div>
          {!collapsed && (
            <p className="text-gray-500 text-[9px] uppercase tracking-[0.15em] mb-2 px-2">Tools & Support</p>
          )}
          <nav className="flex flex-col gap-0.5">
            {toolsSupport.map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                title={collapsed ? label : undefined}
                className="flex items-center gap-2.5 text-gray-400 hover:text-white text-[11px] py-2 px-2 rounded hover:bg-white/5 transition-colors text-left w-full"
              >
                <Icon size={13} className="text-gray-400 flex-shrink-0" />
                {!collapsed && label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-[#2a2a2a] py-4 px-4">
          <p className="text-gray-600 text-[9px] mb-0.5">Logged in as</p>
          <p className="text-gray-400 text-[10px] mb-3 truncate">{userEmail || "—"}</p>
          <button className="w-full py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-400 text-[10px] rounded transition-colors border border-[#3a3a3a]">
            Reset All Data
          </button>
        </div>
      )}
    </aside>
  );
}
