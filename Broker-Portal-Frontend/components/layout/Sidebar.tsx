"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
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
  const isLeadDetail = mounted && /^\/lead\/[^/]+$/.test(pathname ?? "") && pathname !== "/lead/new" && pathname !== "/lead/view";

  return (
    <Box
      component="aside"
      sx={{
        height: "100vh",
        width: "240px",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
        bgcolor: C.bg,
        display: "flex",
        flexDirection: "column",
        borderRight: "none",
      }}
    >
      {/* Sidebar Toggle Button */}
      <IconButton
        aria-label="Toggle sidebar"
        sx={{
          position: "absolute",
          top: "12px",
          left: "196px",
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          color: "#E6E6E6",
          bgcolor: "transparent",
          zIndex: 20,
          transition: "all 0.15s",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.05)",
          },
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
      </IconButton>

      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "8px",
          height: "56px",
          flexShrink: 0,
          pl: "16px",
        }}
      >
        <img
          src="/brokerPortal/rma-logo.png"
          alt="RMA Logo"
          style={{ height: "24px", width: "auto" }}
        />
      </Box>

      {/* Nav */}
      <Box
        component="nav"
        sx={{
          flex: 1,
          overflowY: "auto",
          px: "16px",
          py: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {!mounted ? null : isNewLead || isQuoteJourney || isQuoteTypeSelection || isLeadDetail ? (
          /* Minimal nav for new lead / quote journey / quote type selection / lead detail */
          <>
            <Typography
              variant="caption"
              sx={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                px: "12px",
                mb: "6px",
                color: C.fgMuted,
                display: "block",
              }}
            >
              Actions
            </Typography>
            {[
              { label: "Back", icon: ArrowLeft, href: isLeadDetail ? ROUTES.viewLeads : (isQuoteTypeSelection ? ROUTES.quotes : ROUTES.dashboard) },
            ].map(({ label, icon: Icon, href }) => (
              <Button
                key={label}
                onClick={() => router.push(href)}
                startIcon={<Icon size={16} />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  height: "33px",
                  px: "12px",
                  borderRadius: "8px",
                  border: "1px solid #1E3339",
                  bgcolor: "#0F1619",
                  color: C.primary,
                  fontSize: "14px",
                  fontWeight: 400,
                  textTransform: "none",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#141C20",
                  },
                  "& .MuiButton-startIcon": {
                    marginRight: "10px",
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </>
        ) : (
          /* Full nav for dashboard, quotes page, and all other pages */
          <>
            <Typography
              variant="caption"
              sx={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                px: "12px",
                mb: "4px",
                color: C.fgMuted,
                display: "block",
              }}
            >
              Actions
            </Typography>

            {quickActions.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <Button
                  key={label}
                  onClick={() => router.push(href)}
                  startIcon={<Icon size={14} />}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    height: "32px",
                    px: "12px",
                    borderRadius: "6px",
                    color: isActive ? C.primary : C.fg,
                    bgcolor: isActive ? C.activeBg : "transparent",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "none",
                    position: "relative",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: C.hoverBg,
                      color: C.primary,
                    },
                    "& .MuiButton-startIcon": {
                      marginRight: "8px",
                      color: "inherit",
                    },
                  }}
                >
                  {isActive && (
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "2px",
                        height: "16px",
                        borderRadius: "4px",
                        bgcolor: C.primary,
                      }}
                    />
                  )}
                  {label}
                </Button>
              );
            })}

            <Divider sx={{ my: "12px", borderColor: C.border }} />

            <Typography
              variant="caption"
              sx={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                px: "12px",
                mb: "4px",
                color: C.fgMuted,
                display: "block",
              }}
            >
              Leads and Policies
            </Typography>

            {leadsAndPolicies.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <Button
                  key={label}
                  onClick={() => router.push(href)}
                  startIcon={<Icon size={14} />}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    height: "32px",
                    px: "12px",
                    borderRadius: "6px",
                    color: isActive ? C.primary : C.fg,
                    bgcolor: isActive ? C.activeBg : "transparent",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "none",
                    position: "relative",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: C.hoverBg,
                      color: C.primary,
                    },
                    "& .MuiButton-startIcon": {
                      marginRight: "8px",
                      color: "inherit",
                    },
                  }}
                >
                  {isActive && (
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "2px",
                        height: "16px",
                        borderRadius: "4px",
                        bgcolor: C.primary,
                      }}
                    />
                  )}
                  {label}
                </Button>
              );
            })}

            <Divider sx={{ my: "12px", borderColor: C.border }} />

            <Typography
              variant="caption"
              sx={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                px: "12px",
                mb: "4px",
                color: C.fgMuted,
                display: "block",
              }}
            >
              Tools &amp; Support
            </Typography>

            {toolsSupport.map(({ label, icon: Icon, href }) => {
              const isActive = mounted && pathname === href;
              return (
                <Button
                  key={label}
                  onClick={() => router.push(href)}
                  startIcon={<Icon size={14} />}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    height: "32px",
                    px: "12px",
                    borderRadius: "6px",
                    color: isActive ? C.primary : C.fg,
                    bgcolor: isActive ? C.activeBg : "transparent",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "none",
                    position: "relative",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: C.hoverBg,
                      color: C.primary,
                    },
                    "& .MuiButton-startIcon": {
                      marginRight: "8px",
                      color: "inherit",
                    },
                  }}
                >
                  {isActive && (
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "2px",
                        height: "16px",
                        borderRadius: "4px",
                        bgcolor: C.primary,
                      }}
                    />
                  )}
                  {label}
                </Button>
              );
            })}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: "12px", pb: "16px", pt: "8px" }}>
        <Button
          fullWidth
          startIcon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          }
          onClick={() => {
            // Clear all local storage items
            localStorage.removeItem("bp_token");
            localStorage.removeItem("bp_broker_id");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("bp_broker_email");
            localStorage.removeItem("bp_broker_name");
            
            // Redirect to main app's logout endpoint
            const logoutUrl = `${process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL || "http://localhost:4200"}/api/auth/logout`;
            window.location.href = logoutUrl;
          }}
          sx={{
            height: "30px",
            color: "#8D98A5",
            bgcolor: "transparent",
            fontSize: "12px",
            fontWeight: 400,
            textTransform: "none",
            justifyContent: "flex-start",
            px: "8px",
            transition: "color 0.15s",
            "&:hover": {
              color: "#A7B1BC",
              bgcolor: "transparent",
            },
            "& .MuiButton-startIcon": {
              marginRight: "8px",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
