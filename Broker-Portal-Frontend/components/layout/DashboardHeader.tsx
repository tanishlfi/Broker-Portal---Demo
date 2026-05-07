"use client";

import { Bell } from "lucide-react";
import { useUser } from "@/lib/context/UserContext";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showUser?: boolean;
  headerAction?: React.ReactNode;
}

interface DecodedToken {
  name?: string;
  email?: string;
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

export default function DashboardHeader({ title, subtitle, showUser = true, headerAction }: DashboardHeaderProps) {
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
      setDisplayName(user.email || user.name);
      return;
    }

    // Last resort: decode the JWT token
    try {
      const token = localStorage.getItem("bp_token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        const identity =
          decoded.email ||
          decoded.preferred_username ||
          decoded.upn ||
          decoded.unique_name ||
          decoded.name ||
          (decoded.given_name && decoded.family_name ? `${decoded.given_name} ${decoded.family_name}` : "") ||
          decoded.given_name ||
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
      style={{
        background: "#0B0D10",
        borderBottom: "1px solid rgba(29, 51, 68, 0.4)",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Top row: Welcome message and notification bell */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "1px", height: "17px", background: "#797979" }} />
          {showUser && (
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "15px",
              color: "#A8A8A8",
              margin: 0,
            }}>
              Welcome Back! {displayName && <span style={{ color: "#A8A8A8" }}>{displayName}</span>}
            </p>
          )}
        </div>
        <button
          suppressHydrationWarning
          style={{
            position: "relative",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Notifications"
        >
          <Bell size={20} color="#E6E6E6" />
        </button>
      </div>

      {/* Bottom row: Title and action button */}
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: "17px" }}>
          <div>
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "24px",
              fontWeight: 500,
              lineHeight: "36px",
              letterSpacing: "0.0703125px",
              color: "#FFFFFF",
              margin: 0,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "17px",
                color: "#A8A8A8",
                margin: 0,
                marginTop: "4px",
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
    </header>
  );
}
