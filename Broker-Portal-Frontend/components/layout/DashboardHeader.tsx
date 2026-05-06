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
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

export default function DashboardHeader({ title, subtitle, showUser = true }: DashboardHeaderProps) {
  const [displayName, setDisplayName] = useState("");
  let user = null;
  try {
    const context = useUser();
    user = context?.user;
  } catch (error) {
    // UserContext not available, will use fallback
  }

  useEffect(() => {
    // Try to get name from UserContext first
    if (user?.name || user?.email) {
      setDisplayName(user.name || user.email);
      return;
    }

    // Fallback to localStorage
    const storedName = localStorage.getItem("userName") || 
                       localStorage.getItem("bp_broker_name") ||
                       localStorage.getItem("userEmail") ||
                       localStorage.getItem("bp_broker_email");
    
    if (storedName) {
      setDisplayName(storedName);
      return;
    }

    // Last resort: decode the JWT token
    try {
      const token = localStorage.getItem("bp_token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        const name = decoded.name || 
                     decoded.email || 
                     (decoded.given_name && decoded.family_name ? `${decoded.given_name} ${decoded.family_name}` : "") ||
                     decoded.given_name ||
                     "";
        if (name) {
          setDisplayName(name);
          // Store it for future use
          localStorage.setItem("userName", name);
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, [user]);

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        background: "#1E1E1E",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        {showUser && (
          <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>
            Welcome Back!{displayName && <> <strong style={{ color: "var(--foreground)" }}>{displayName}</strong></>}
          </p>
        )}
        <h1 style={{ fontSize: "1.5rem", fontWeight: 500, color: "var(--foreground)", lineHeight: 1.5 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)", marginTop: "0.25rem", lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button suppressHydrationWarning className="header-bell" aria-label="Notifications">
          <Bell size={20} />
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: "var(--primary)" }}
          />
        </button>
      </div>
    </header>
  );
}
