"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("bp_token");
    const brokerId = getCookie("bp_broker_id");

    if (token) {
      localStorage.setItem("bp_token", token);

      // Extract user identity from token
      try {
        const decoded: any = jwtDecode(token);
        const email =
          decoded.email ||
          decoded.preferred_username ||
          decoded.upn ||
          decoded.unique_name ||
          "";
        const name =
          decoded.name ||
          (decoded.given_name && decoded.family_name
            ? `${decoded.given_name} ${decoded.family_name}`
            : "") ||
          decoded.given_name ||
          "";
        if (email) localStorage.setItem("userEmail", email);
        if (name) localStorage.setItem("userName", name);
      } catch {}

      if (brokerId) localStorage.setItem("bp_broker_id", brokerId);

      // Clear cookies after reading
      clearCookie("bp_token");
      clearCookie("bp_broker_id");

      router.replace("/brokerPortal/dashboard");
      return;
    }

    // No cookie — check if existing token in localStorage is still valid
    if (isTokenValid()) {
      router.replace("/brokerPortal/dashboard");
    } else {
      localStorage.removeItem("bp_token");

      // In local dev, skip auth and go straight to dashboard
      if (process.env.NODE_ENV === "development") {
        router.replace("/brokerPortal/dashboard");
      }
      // In production with no token, stay on page (shouldn't happen in multizone flow)
    }
  }, [router]);

  return null;
}
