"use client";

import "../globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Minus, Search, Bot, Download } from "lucide-react";

const navItems = ["Dashboard", "Leads", "Employer Policies", "Failed Invoice Payments", "FAQ", "Broker Training"];

const faqData = [
  {
    question: "How can I update the details of an employer policy?",
    answer:
      'To update the details of an employer policy, choose the "View" option in the My Policies section. From there, you can modify the employer\'s contact information, coverage options, and other policy details. Be sure to save any changes after updating.',
  },
  {
    question: "What do I do if an invoice shows as unpaid or partially paid?",
    answer:
      "If an invoice shows as unpaid or partially paid, navigate to the Failed Invoice Payments section to review the details. You can retry the payment or contact support for assistance.",
  },
  {
    question: "How can I add a new lead?",
    answer:
      'To add a new lead, click the "Add New Lead" button in the top right corner of the dashboard or navigate to the Leads section and use the add option.',
  },
  {
    question: "What is Mahala Group Cover, and how does it benefit employers?",
    answer:
      "Mahala Group Cover is a complimentary group benefit offering that provides basic cover to employees at no cost to the employer. It helps attract and retain talent while providing essential protection.",
  },
  {
    question: "When are policy invoices generated?",
    answer:
      "Invoices are generated at the beginning of each billing cycle.",
  },
  {
    question: "How can I add a new lead?",
    answer:
      'To add a new lead, click the "Add New Lead" button in the top right corner of the dashboard or navigate to the Leads section and use the add option.',
  },
];

export default function FAQ() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("FAQ");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filtered = faqData.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">

      {/* HEADER */}
      <div
        className="text-white px-8 py-12 flex justify-between items-center"
        style={{ background: "linear-gradient(160deg, #1a5dc8 0%, #2e7de0 40%, #1a4faa 100%)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-5xl leading-none" style={{ color: "#7dd3fc", fontFamily: "Georgia, serif", letterSpacing: "-2px" }}>
            RMA
          </span>
          <span className="text-white text-lg font-normal ml-2">RMA Broker Portal</span>
        </div>
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
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Dashboard") router.push("/dashboard");
                else if (item === "Leads") router.push("/quote");
                else setActiveNav(item);
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
          <div className="ml-auto">
            <button className="px-4 py-2 bg-[#f59e0b] text-white text-sm font-medium rounded hover:bg-[#d97706] transition-colors cursor-pointer whitespace-nowrap">
              Add New Lead
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-8 py-6 pb-24">

        {/* Title + search + export */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl font-semibold text-gray-800">FAQ</h2>
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded text-sm w-96 focus:outline-none focus:ring-1 focus:ring-[#2e7de0]"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2e7de0] text-white text-sm rounded hover:bg-[#1a5dc8] transition-colors cursor-pointer">
              <Download size={14} /> Export <ChevronDown size={12} />
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Browse through common questions by expanding each item for answers, or use the search and filters below to find answers quickly.
        </p>

        {/* BOX */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

          {/* Filter row */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200">
            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none">
              <option>All Categories</option>
            </select>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2e7de0]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#2e7de0]"
              />
            </div>
            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 focus:outline-none cursor-pointer">
              <option>Filter</option>
            </select>
            <button
              onClick={() => setSearch("")}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Accordion */}
          {filtered.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#2e7de0] flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-[#2e7de0] flex items-center justify-center flex-shrink-0 ml-4">
                    {isOpen ? <Minus size={13} className="text-white" /> : <Plus size={13} className="text-white" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-14 pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination — static UI */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500 mr-2">1–5 of 16</span>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-400 cursor-default">‹ Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">Next ›</button>
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
