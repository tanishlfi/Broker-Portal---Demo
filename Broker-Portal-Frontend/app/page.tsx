"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify message origin from trusted Client Connect URL
      if (event.origin !== process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL) return;
      
      if (event.data?.type !== "BP_AUTH") return;
      const { token, brokerId } = event.data;
      if (token) localStorage.setItem("bp_token", token);
      if (brokerId) localStorage.setItem("bp_broker_id", brokerId);
      router.replace("/dashboard");
    };

    window.addEventListener("message", handleMessage);

    // Only go to dashboard if token is still valid
    if (isTokenValid()) {
      router.replace("/dashboard");
    } else {
      // No valid token — clear stale data and wait for postMessage from Client Connect
      localStorage.removeItem("bp_token");
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return null;
}
