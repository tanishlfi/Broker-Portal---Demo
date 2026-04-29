"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showUser?: boolean;
}

export default function DashboardHeader({ title, subtitle, showUser = true }: DashboardHeaderProps) {
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    setCurrentUser(localStorage.getItem("userEmail") ?? localStorage.getItem("bp_broker_email") ?? "");
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
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
        {currentUser && showUser && (
          <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>
            Current User: {currentUser}
          </span>
        )}
        <button className="header-bell" aria-label="Notifications">
          <Bell size={20} />
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: "var(--primary)" }}
          />
        </button>
        <button
          className="header-logout"
          style={{ fontSize: "14px" }}
          onClick={() =>
            (window.location.href =
              process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL || "http://localhost:4200")
          }
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
