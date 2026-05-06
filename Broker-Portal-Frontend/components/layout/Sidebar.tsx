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
  bg: "var(--sidebar)",
  border: "var(--sidebar-border)",
  primary: "var(--primary)",
  fg: "var(--sidebar-foreground)",
  fgMuted: "var(--sidebar-foreground-muted)",
  activeBg: "var(--sidebar-active-bg)",
  hoverBg: "var(--sidebar-accent)",
};

const quickActions = [
  { label: "Start New Lead", icon: Plus, href: ROUTES.newLead },
  { label: "View Leads", icon: Eye, href: ROUTES.viewLeads },
  { label: "Quotes", icon: FileText, href: ROUTES.quotes },
  { label: "My Policies", icon: Shield, href: "#" },
];

const toolsSupport = [
  { label: "Failed Invoices", icon: AlertCircle, href: "#" },
  { label: "FAQ", icon: HelpCircle, href: "#" },
  { label: "Training", icon: GraduationCap, href: "#" },
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
        width: "16rem",
        background: C.bg,
        borderRightWidth: "1px",
        borderRightStyle: "solid",
        borderRightColor: C.border,
      }}
    >
      {/* Logo */}
      <div
        className={isNewLead || isQuoteJourney ? "p-4" : "p-6"}
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <img
          src="/rma-logo.png"
          alt="RMA Logo"
          className={isNewLead || isQuoteJourney ? "h-10 w-auto" : "h-12 w-auto"}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {!mounted ? null : isNewLead || isQuoteJourney || isQuoteTypeSelection ? (
          /* Minimal nav for new lead / quote journey / quote type selection */
          <>
            {[
              { label: "Back", icon: ArrowLeft, href: isQuoteTypeSelection ? ROUTES.quotes : ROUTES.dashboard },
              ...(isQuoteJourney ? [{ label: "View All Leads", icon: Eye, href: ROUTES.viewLeads }] : []),
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  height: "2.75rem",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: C.fg,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  gap: "12px",
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
                <Icon size={20} style={{ flexShrink: 0 }} />
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
                  width: "100%", height: "2.75rem", padding: "0 12px", borderRadius: "6px",
                  border: "none", background: "transparent", color: C.fg,
                  fontSize: "0.875rem", fontWeight: 500, gap: "12px", cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hoverBg; (e.currentTarget as HTMLElement).style.color = C.primary; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.fg; }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
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
                width: "100%", height: "2.75rem", padding: "0 12px", borderRadius: "6px",
                border: "none", background: "transparent", color: C.fg,
                fontSize: "0.875rem", fontWeight: 500, gap: "12px", cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hoverBg; (e.currentTarget as HTMLElement).style.color = C.primary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.fg; }}
            >
              <FileText size={20} style={{ flexShrink: 0 }} />
              <span>Quotes</span>
            </button>

            <div className="my-3" style={{ borderTop: `1px solid ${C.border}` }} />

            <p className="text-xs uppercase tracking-wider px-3 mb-2" style={{ color: C.fgMuted }}>
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
                  height: "2.75rem",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: C.fg,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  gap: "12px",
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
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </button>
            ))}
          </>
        ) : (
          /* Full nav for dashboard, quotes page, and all other pages */
          <>
            <p className="text-xs uppercase tracking-wider px-3 mb-2" style={{ color: C.fgMuted }}>
              Quick Actions
            </p>

            {quickActions.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <button
                  key={label}
                  onClick={() => href !== "#" && router.push(href)}
                  className="w-full flex items-center gap-3 px-3 rounded-md text-sm text-left"
                  style={{
                    height: "2.75rem",
                    color: isActive ? C.primary : C.fg,
                    background: isActive ? C.activeBg : "transparent",
                    transition: "background 0.15s, color 0.15s",
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
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}

            <div className="my-3" style={{ borderTop: `1px solid ${C.border}` }} />

            <p className="text-xs uppercase tracking-wider px-3 mb-2" style={{ color: C.fgMuted }}>
              Tools &amp; Support
            </p>

            {toolsSupport.map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => href !== "#" && router.push(href)}
                className="w-full flex items-center gap-3 px-3 rounded-md text-sm text-left"
                style={{
                  height: "2.75rem",
                  color: C.fg,
                  background: "transparent",
                  transition: "background 0.15s, color 0.15s",
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
                <Icon size={20} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div
        className="p-4 space-y-3"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div>
          <p className="text-xs mb-0.5" style={{ color: C.fgMuted }}>Logged in as</p>
          <p className="text-sm truncate" style={{ color: C.fg }}>{userEmail || "—"}</p>
        </div>
        <button
          suppressHydrationWarning
          className="w-full py-1.5 rounded-md text-xs"
          style={{
            color: C.fg,
            background: "transparent",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: C.border,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hoverBg; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          onClick={() => { localStorage.clear(); window.location.reload(); }}
        >
          Reset All Data
        </button>
      </div>
    </aside>
  );
}
