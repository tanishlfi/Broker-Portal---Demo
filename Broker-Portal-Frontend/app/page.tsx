"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
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
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return null;
}
