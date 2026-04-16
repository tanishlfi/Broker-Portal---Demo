"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = () => {
    if (email) localStorage.setItem("userEmail", email);
    router.push(ROUTES.dashboard);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
      <div className="w-full max-w-md px-8 py-10 bg-[#13132b] rounded-2xl shadow-2xl border border-gray-800">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[#29abe2] font-black italic text-3xl tracking-tight">RMA</span>
          <span className="text-gray-400 text-sm">Broker Portal</span>
        </div>

        <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to your broker account</p>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-gray-400 mb-1.5">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-[#1a1a2e] text-white placeholder-gray-500 outline-none focus:border-[#29abe2] transition-colors text-sm"
          />
        </div>

        <button className="w-full py-3 bg-[#29abe2] hover:bg-[#1a8fc1] text-white font-semibold rounded-lg text-sm transition-colors mb-6">
          Send OTP
        </button>

        {/* OTP */}
        <div className="mb-6">
          <label htmlFor="otp" className="block text-sm text-gray-400 mb-1.5">One-Time Password</label>
          <input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-[#1a1a2e] text-white placeholder-gray-500 outline-none focus:border-[#29abe2] transition-colors text-sm"
          />
          <div className="flex justify-end mt-2">
            <button className="text-xs text-[#29abe2] hover:underline">Resend OTP</button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-[#29abe2] hover:bg-[#1a8fc1] text-white font-bold rounded-lg text-sm transition-colors"
        >
          Login
        </button>

        <p className="mt-6 text-center text-xs text-gray-500">
          For assistance, contact{" "}
          <a href="mailto:support@rma.co.za" className="text-[#29abe2] hover:underline">
            support@rma.co.za
          </a>
        </p>
      </div>
    </div>
  );
}
