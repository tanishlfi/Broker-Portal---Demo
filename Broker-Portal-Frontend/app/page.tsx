"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify message origin from trusted Client Connect URL
      if (event.origin !== process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL) return;
      
      if (event.data?.type !== "BP_AUTH") return;
      const { token, brokerId, userName, userEmail } = event.data;
      if (token) {
        localStorage.setItem("bp_token", token);

        // Extract user identity from token and store for header display
        try {
          const decoded: any = jwtDecode(token);
          const email = decoded.email || decoded.preferred_username || decoded.upn || decoded.unique_name || "";
          const name = decoded.name || (decoded.given_name && decoded.family_name ? `${decoded.given_name} ${decoded.family_name}` : "") || decoded.given_name || "";
          if (email) localStorage.setItem("userEmail", email);
          if (name) localStorage.setItem("userName", name);
        } catch {}
      }
      // Also store if passed directly from Client Connect
      if (userEmail) localStorage.setItem("userEmail", userEmail);
      if (userName) localStorage.setItem("userName", userName);
      if (brokerId) localStorage.setItem("bp_broker_id", brokerId);
      router.replace("/dashboard");
    };

    window.addEventListener("message", handleMessage);

    // Only go to dashboard if token is still valid
    if (isTokenValid()) {
      router.replace("/dashboard");
    } else {
      // No valid token — clear stale data
      localStorage.removeItem("bp_token");

      // In local dev, skip auth and go straight to dashboard
      if (process.env.NODE_ENV === "development") {
        router.replace("/dashboard");
      }
      // In production, wait for postMessage from Client Connect
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return null;
}
