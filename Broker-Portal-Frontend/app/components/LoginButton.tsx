"use client";

import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/dashboard")}
      className="w-full mt-3 py-3 bg-[#1e5fa8] hover:bg-[#174d8a] text-white font-semibold rounded text-base transition-colors cursor-pointer"
    >
      Login
    </button>
  );
}
