"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

    // if already has token (e.g. refresh), go straight to dashboard
    if (localStorage.getItem("bp_token")) {
      router.replace("/dashboard");
    } else {
      // no token, redirect to dashboard anyway (will handle auth there if needed)
      router.replace("/dashboard");
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return null;
}
