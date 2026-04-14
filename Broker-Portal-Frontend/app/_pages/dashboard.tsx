"use client";

import "../globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Briefcase, FileWarning, ChevronDown, Bot } from "lucide-react";
 
const navItems = ["Dashboard", "Leads", "Employer Policies", "Failed Invoice Payments", "FAQ", "Broker Training"];
 //
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const router = useRouter();
 
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
 
      {/* HEADER */}
      <div
        className="text-white px-8 py-12 flex justify-between items-center"
        style={{ background: "linear-gradient(160deg, #1a5dc8 0%, #2e7de0 40%, #1a4faa 100%)" }}
      >
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <span
            className="font-extrabold text-5xl leading-none"
            style={{ color: "#7dd3fc", fontFamily: "Georgia, serif", letterSpacing: "-2px" }}
          >
            RMA
          </span>
          <span className="text-white text-lg font-normal ml-2">RMA Broker Portal</span>
        </div>
 
        {/* Right side */}
        <div className="flex items-center gap-6 text-sm font-light">
          <button className="flex items-center gap-1 hover:underline cursor-pointer">
            Welcome, John Smith <ChevronDown size={14} />
          </button>
          <button onClick={() => router.push("/")} className="flex items-center gap-1 hover:underline cursor-pointer">
            Log Out <ChevronDown size={14} />
          </button>
        </div>
      </div>
 
      {/* NAV */}
      <div className="bg-white shadow-sm px-8">
        <div className="flex items-center gap-1 w-[83%]">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Leads") {
                  router.push("/quote");
                } else if (item === "FAQ") {
                  router.push("/faq");
                } else {
                  setActiveNav(item);
                }
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeNav === item
                  ? "text-white bg-[#2e7de0] border-[#2e7de0] rounded-sm"
                  : "text-gray-600 border-transparent hover:text-[#2e7de0]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
 
      {/* CONTENT */}
      <div className="px-8 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Broker Dashboard</h2>
        <p className="text-gray-500 mb-8">
          Welcome back, <span className="font-bold text-gray-700">John Smith</span>. Here is an overview of your latest activity.
        </p>
 
        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Leads */}
          <div onClick={() => router.push("/quote")} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
            <Users className="text-green-600 w-12 h-12" strokeWidth={1.5} />
            <div>
              <div className="text-4xl font-bold text-gray-800">91</div>
              <div className="text-gray-500 text-sm mt-0.5">Leads</div>
            </div>
          </div>
 
          {/* Employer Policies */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <Briefcase className="text-[#2e7de0] w-12 h-12" strokeWidth={1.5} />
            <div>
              <div className="text-4xl font-bold text-gray-800">287</div>
              <div className="text-gray-500 text-sm mt-0.5">Employer Policies</div>
            </div>
          </div>
 
          {/* Failed Invoice Payments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <FileWarning className="text-red-500 w-12 h-12" strokeWidth={1.5} />
            <div>
              <div className="text-4xl font-bold text-gray-800">5</div>
              <div className="text-gray-500 text-sm mt-0.5">Failed Invoice Payments</div>
            </div>
          </div>
        </div>
      </div>
 
      {/* CHATBOT FAB */}
      <button
        className="fixed bottom-6 right-6 w-13 h-13 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg hover:bg-teal-600 transition-colors p-3 cursor-pointer"
        aria-label="Open chat"
      >
        <Bot size={26} />
      </button>
    </div>
  );
}
