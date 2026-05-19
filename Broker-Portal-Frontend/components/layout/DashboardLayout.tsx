"use client";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export default function DashboardLayout({ children, title = "", subtitle, headerAction }: DashboardLayoutProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const expectedOrigin = process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL;
      if (expectedOrigin && event.origin !== expectedOrigin) return;
      if (event.data?.type !== "BP_AUTH") return;

      const { token, brokerId, userName, userEmail } = event.data;
      if (token) {
        localStorage.setItem("bp_token", token);
        try {
          const decoded: any = jwtDecode(token);
          const email = decoded.email || decoded.preferred_username || decoded.upn || decoded.unique_name || "";
          const name = decoded.name || (decoded.given_name && decoded.family_name
            ? `${decoded.given_name} ${decoded.family_name}` : "") || decoded.given_name || "";
          if (email) localStorage.setItem("userEmail", email);
          if (name) localStorage.setItem("userName", name);
        } catch { }
      }
      if (userEmail) localStorage.setItem("userEmail", userEmail);
      if (userName) localStorage.setItem("userName", userName);
      if (brokerId) localStorage.setItem("bp_broker_id", brokerId);
    };

    window.addEventListener("message", handleMessage);

    // Signal to the opener (Client Connect) that this page is ready to receive the token
    if (window.opener) {
      const clientConnectOrigin = process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL || "*";
      window.opener.postMessage({ type: "BP_READY" }, clientConnectOrigin);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <Sidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflowY: "auto",
          height: "100vh",
          marginLeft: "var(--sidebar-width)",
          background: "var(--background)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <DashboardHeader title={title} subtitle={subtitle} showUser={true} />
        {children}
      </Box>
    </>
  );
}
