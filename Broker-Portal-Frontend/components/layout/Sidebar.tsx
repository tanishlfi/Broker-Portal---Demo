"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus, Eye, FileText, Shield,
  AlertCircle, HelpCircle, GraduationCap, ArrowLeft, MessageCircle,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getLeads } from "@/lib/api/leads";
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
  { label: "Policies", icon: Shield, href: "#" },
];

const toolsSupport = [
  { label: "Failed Invoices", icon: AlertCircle, href: "#" },
  { label: "FAQ", icon: HelpCircle, href: "#" },
  { label: "Training", icon: GraduationCap, href: "#" },
  { label: "Chatbot", icon: MessageCircle, href: "#" },
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
  const isViewLeads = mounted && pathname === ROUTES.viewLeads;
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
      {/* Logo */}
      <div
        className="px-4 py-3"
        style={{ 
          margin: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px"
        }}
      >
        <img
          src="/rma-logo.png"
          alt="RMA Logo"
          className="h-6 w-auto"
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
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
                  width: "100%",
                  height: "2rem",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: C.activeBg,
                  color: C.primary,
                  fontSize: "12px",
                  fontWeight: 500,
                  gap: "8px",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(31,195,235,0.18)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = C.activeBg;
                }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </button>
            ))}
          </>
        ) : isViewLeads ? (
          /* View Leads nav: Back to Dashboard, Quotes, then Support section */
          <>
            {[
              { label: "Back to Dashboard", icon: ArrowLeft, href: ROUTES.dashboard },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "flex-start",
                  width: "100%", height: "2rem", padding: "0 10px", borderRadius: "6px",
                  border: "none", background: "transparent", color: C.fg,
                  fontSize: "12px", fontWeight: 500, gap: "8px", cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hoverBg; (e.currentTarget as HTMLElement).style.color = C.primary; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.fg; }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </button>
            ))}

            {/* Quotes — navigates to the quote journey for the first actionable lead */}
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("bp_token") ?? "";
                  const representativeId = localStorage.getItem("bp_broker_id") ?? undefined;
                  const leads = await getLeads(token, representativeId);
                  const actionable = leads.find((l) =>
                    ["Draft", "In Progress", "Quote Expired"].includes(l.status)
                  ) ?? leads[0];
                  if (actionable) {
                    router.push(`/lead/${actionable.leadId}/quote?ref=${actionable.leadReference}&company=${encodeURIComponent(actionable.employerName)}`);
                  }
                } catch { /* nothing to navigate to */ }
              }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "flex-start",
                width: "100%", height: "2rem", padding: "0 10px", borderRadius: "6px",
                border: "none", background: "transparent", color: C.fg,
                fontSize: "12px", fontWeight: 500, gap: "8px", cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hoverBg; (e.currentTarget as HTMLElement).style.color = C.primary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.fg; }}
            >
              <FileText size={14} style={{ flexShrink: 0 }} />
              <span>Quotes</span>
            </button>

            <div className="my-3" style={{ borderTop: `1px solid ${C.border}` }} />

            <p className="text-[10px] uppercase tracking-wide px-3 mb-1.5" style={{ color: C.fgMuted }}>
              Support
            </p>

            {[
              { label: "FAQ", icon: HelpCircle, href: "#" },
              { label: "Training", icon: GraduationCap, href: "#" },
              { label: "Chatbot Support", icon: MessageCircle, href: "#" },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => href !== "#" && router.push(href)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  height: "2rem",
                  padding: "0 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: C.fg,
                  fontSize: "12px",
                  fontWeight: 500,
                  gap: "8px",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = C.hoverBg;
                  (e.currentTarget as HTMLElement).style.color = C.primary;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = C.fg;
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

            {toolsSupport.map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => {
                  if (href !== "#") {
                    router.push(href);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 rounded-md text-left"
                style={{
                  height: "2rem",
                  color: C.fg,
                  background: "transparent",
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
                  el.style.background = "transparent";
                  el.style.color = C.fg;
                }}
              >
                <Icon size={14} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
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
