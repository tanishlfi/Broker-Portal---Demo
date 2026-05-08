"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus, Eye, FileText, Shield,
  AlertCircle, HelpCircle, GraduationCap, ArrowLeft, MessageCircle,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useUser } from "@/lib/context/UserContext";

const C = {
  bg: "#0B0D10",
  border: "#1D2A36",
  primary: "#1FC3EB",
  fg: "#C4CDD8",
  fgMuted: "#5E6A77",
  activeBg: "rgba(31, 195, 235, 0.14)",
  hoverBg: "rgba(255,255,255,0.06)",
};

const quickActions = [
  { label: "Dashboard", icon: Plus, href: ROUTES.dashboard },
];

const leadsAndPolicies = [
  { label: "Leads", icon: Eye, href: ROUTES.viewLeads },
  { label: "Quotes", icon: FileText, href: ROUTES.quotes },
  { label: "Policies", icon: Shield, href: ROUTES.policies },
];

const toolsSupport = [
  { label: "Failed Invoices", icon: AlertCircle, href: ROUTES.failedInvoices },
  { label: "FAQ", icon: HelpCircle, href: ROUTES.faq },
  { label: "Training", icon: GraduationCap, href: ROUTES.training },
  { label: "Chatbot", icon: MessageCircle, href: ROUTES.chatbot },
];

interface SidebarProps {
  userEmail?: string;
}

export default function Sidebar({ userEmail: propEmail }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(propEmail ?? "");
  const [mounted, setMounted] = useState(false);

  let user = null;
  try {
    const userContext = useUser();
    user = userContext?.user;
  } catch {}

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    } else if (propEmail) {
      setUserEmail(propEmail);
    } else {
      setUserEmail(localStorage.getItem("userEmail") ?? "");
    }
  }, [user, propEmail]);

  const isNewLead = mounted && pathname === ROUTES.newLead;
  const isQuoteJourney = mounted && /^\/lead\/[^/]+\/quote/.test(pathname ?? "");
  const isQuoteTypeSelection = mounted && pathname === "/quotes/new";

  return (
    <aside
      className="h-screen flex flex-col flex-shrink-0 fixed left-0 top-0 z-10"
      style={{
        width: "240px",
        background: C.bg,
        borderRightWidth: "0px",
      }}
    >
      {/* Sidebar Toggle Button */}
      <button
        aria-label="Toggle sidebar"
        style={{
          background: "transparent",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          padding: 0,
          width: "32px",
          height: "32px",
          position: "absolute",
          top: "12px",
          left: "196px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          zIndex: 20,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="1.5"
            width="13"
            height="13"
            rx="1.5"
            stroke="#E6E6E6"
            strokeWidth="1.2"
          />
          <path
            d="M5.5 1.5V14.5"
            stroke="#E6E6E6"
            strokeWidth="1.2"
          />
        </svg>
      </button>

      {/* Logo */}
      <div
        className="px-4"
        style={{ 
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "8px",
          height: "56px",
          flexShrink: 0,
          paddingLeft: "16px",
        }}
      >
        <img
          src="/rma-logo.png"
          alt="RMA Logo"
          className="h-6 w-auto"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {!mounted ? null : isNewLead || isQuoteJourney || isQuoteTypeSelection ? (
          /* Minimal nav for new lead / quote journey / quote type selection */
          <>
            <p className="text-[10px] uppercase tracking-wide px-3 mb-1.5" style={{ color: C.fgMuted }}>
              Actions
            </p>
            {[
              { label: "Back", icon: ArrowLeft, href: isQuoteTypeSelection ? ROUTES.quotes : ROUTES.dashboard },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "216px",
                  height: "33px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #1E3339",
                  background: "#0F1619",
                  color: C.primary,
                  fontSize: "12px",
                  fontWeight: 500,
                  gap: "10px",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "#141C20";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "#0F1619";
                }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </button>
            ))}
          </>
        ) : (
          /* Full nav for dashboard, quotes page, and all other pages */
          <>
            <p className="text-[10px] uppercase tracking-wide px-3" style={{ color: C.fgMuted, marginBottom: "4px" }}>
              Actions
            </p>

            {quickActions.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="w-full flex items-center gap-2 px-3 rounded-md text-left relative"
                  style={{
                    height: "2rem",
                    color: isActive ? C.primary : C.fg,
                    background: isActive ? C.activeBg : "transparent",
                    transition: "background 0.15s, color 0.15s",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = C.hoverBg;
                    el.style.color = C.primary;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = isActive ? C.activeBg : "transparent";
                    el.style.color = isActive ? C.primary : C.fg;
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-4 rounded"
                      style={{ width: "2px", background: C.primary }}
                    />
                  )}
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}

            <div className="my-3" style={{ borderTop: `1px solid ${C.border}` }} />

            <p className="text-[10px] uppercase tracking-wide px-3" style={{ color: C.fgMuted, marginBottom: "4px" }}>
              Leads and Policies
            </p>

            {leadsAndPolicies.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="w-full flex items-center gap-2 px-3 rounded-md text-left relative"
                  style={{
                    height: "2rem",
                    color: isActive ? C.primary : C.fg,
                    background: isActive ? C.activeBg : "transparent",
                    transition: "background 0.15s, color 0.15s",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = C.hoverBg;
                    el.style.color = C.primary;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = isActive ? C.activeBg : "transparent";
                    el.style.color = isActive ? C.primary : C.fg;
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-4 rounded"
                      style={{ width: "2px", background: C.primary }}
                    />
                  )}
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}

            <div className="my-3" style={{ borderTop: `1px solid ${C.border}` }} />

            <p className="text-[10px] uppercase tracking-wide px-3" style={{ color: C.fgMuted, marginBottom: "4px" }}>
              Tools &amp; Support
            </p>

            {toolsSupport.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="w-full flex items-center gap-2 px-3 rounded-md text-left relative"
                  style={{
                    height: "2rem",
                    color: isActive ? C.primary : C.fg,
                    background: isActive ? C.activeBg : "transparent",
                    transition: "background 0.15s, color 0.15s",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = C.hoverBg;
                    el.style.color = C.primary;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = isActive ? C.activeBg : "transparent";
                    el.style.color = isActive ? C.primary : C.fg;
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-4 rounded"
                      style={{ width: "2px", background: C.primary }}
                    />
                  )}
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2">
        <button
          suppressHydrationWarning
          className="w-full flex items-center gap-2 px-2 rounded-md text-left"
          style={{
            height: "1.875rem",
            color: "#8D98A5",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.15s",
            fontSize: "12px",
            fontWeight: 400,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#A7B1BC";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#8D98A5";
          }}
          onClick={() => {
            window.location.href = process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL || "http://localhost:4200";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
