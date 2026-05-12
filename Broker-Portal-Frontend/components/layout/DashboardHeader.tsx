"use client";

import { Bell } from "lucide-react";
import { useUser } from "@/lib/context/UserContext";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showUser?: boolean;
}

interface DecodedToken {
  name?: string;
  email?: string;
  user?: string;
  preferred_username?: string;
  upn?: string;
  unique_name?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

const C = {
  primary: "#1FC3EB",
};

export default function DashboardHeader({ title, subtitle, showUser = true }: DashboardHeaderProps) {
  const [displayName, setDisplayName] = useState("");
  let user = null;
  try {
    const context = useUser();
    user = context?.user;
  } catch (error) {
    // UserContext not available, will use fallback
  }

  const resolveDisplayIdentity = () => {
    // Prefer persisted user identity from localStorage for consistent header display.
    const storedIdentity =
      localStorage.getItem("bp_broker_email") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("bp_broker_name") ||
      localStorage.getItem("userName");

    if (storedIdentity) {
      setDisplayName(storedIdentity);
      return;
    }

    // Fallback to UserContext
    if (user?.email || user?.name) {
      setDisplayName((user.email || user.name) ?? "");
      return;
    }

    // Last resort: decode the JWT token
    try {
      const token = localStorage.getItem("bp_token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        const identity =
          decoded.name ||
          (decoded.given_name && decoded.family_name ? `${decoded.given_name} ${decoded.family_name}` : "") ||
          decoded.given_name ||
          decoded.email ||
          decoded.user ||
          decoded.preferred_username ||
          decoded.upn ||
          decoded.unique_name ||
          "";

        if (identity) {
          setDisplayName(identity);
          // Persist for future page loads.
          if (identity.includes("@")) {
            localStorage.setItem("userEmail", identity);
          } else {
            localStorage.setItem("userName", identity);
          }
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  useEffect(() => {
    resolveDisplayIdentity();
    // Retry once after mount in case localStorage is populated slightly later.
    const t = setTimeout(resolveDisplayIdentity, 250);
    return () => clearTimeout(t);
  }, [user]);

  return (
    <header
      className="flex items-center justify-between py-4 flex-shrink-0"
      style={{
        background: "#0B0D10",
        borderBottom: "none",
        paddingLeft: "0px",
        paddingRight: "24px",
        height: "56px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="flex items-center h-full">
        <div style={{ 
          width: "1px", 
          height: "20px", 
          background: "#797979", 
          alignSelf: "center",
          flexShrink: 0,
        }} />
        <div style={{ 
          marginLeft: "12px", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center",
          height: "100%",
          transform: "translateY(-2px)"
        }}>
          {showUser && (
            <p style={{ fontSize: "0.8125rem", fontWeight: 400, color: "var(--muted-foreground)", marginBottom: "0.125rem" }}>
              Welcome Back{displayName && <>! <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{displayName}</span></>}
            </p>
          )}
          {title ? (
            <h1 style={{ fontSize: "1.5rem", fontWeight: 500, color: "var(--foreground)", lineHeight: 1.5 }}>
              {title}
            </h1>
          ) : null}
          {subtitle && (
            <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)", marginTop: "0.25rem", lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button suppressHydrationWarning className="header-bell" aria-label="Notifications" style={{ width: "20px", height: "20px", padding: 0 }}>
          <div style={{ width: "20px", height: "20px", position: "relative" }}>
            <Bell size={16} style={{ position: "absolute", top: "2px", left: "2px", pointerEvents: "none" }} />
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
          </div>
        </button>
      </div>
    </header>
  );
}
