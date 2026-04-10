"use client";

import "../../globals.css";
import { useState } from "react";

const provinces: string[] = [];
const industries: string[] = [];



export default function QuotePage() {
  const [employees, setEmployees] = useState("");
  const [gender, setGender] = useState("");
  const [avgAge, setAvgAge] = useState("");
  const [salary, setSalary] = useState("");
  const [province, setProvince] = useState("");
  const [industry, setIndustry] = useState("");

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(160deg, #e8f4fb 0%, #f5faff 50%, #eaf6fb 100%)" }}
    >
      {/* LOGO */}
      <div className="flex flex-col items-center pt-10 pb-4">
        <span
          className="font-extrabold text-5xl leading-none"
          style={{ color: "#2e9fd8", fontFamily: "Georgia, serif", letterSpacing: "-2px" }}
        >
          RMA
        </span>
        <span className="text-gray-400 text-sm mt-1 tracking-wide">
          Caring | Compassionate | Compensation
        </span>
      </div>

      {/* CONTENT — no card, blends into background */}
      <div className="w-full max-w-lg mx-4 px-4 mt-6 mb-10">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Let&apos;s get you your quick cost estimate
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          We just need a little info to do the maths
        </p>

        {/* PROGRESS BAR — static 15%, rectangular */}
        <div className="w-full bg-gray-200 h-7 mb-6 flex items-center">
          <div
            className="h-7 flex items-center px-3"
            style={{ width: "15%", background: "#2e9fd8" }}
          >
            <span className="text-white text-xs font-semibold">15%</span>
          </div>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-5">

          {/* Employees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              How many employees do you plan to cover?
            </label>
            <input
              type="number"
              placeholder="Enter number of employees"
              value={employees}
              min={0}
              onChange={(e) => setEmployees(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#2e9fd8] bg-white"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Are they...
            </label>
            <div className="flex gap-6">
              {["Mostly male", "Mostly female", "Even split"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGender(gender === opt ? "" : opt)}
                  className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${gender === opt ? "border-[#2e9fd8]" : "border-gray-400"}`}>
                    {gender === opt && <span className="w-2 h-2 rounded-full bg-[#2e9fd8]" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Average Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              What is their average age?
            </label>
            <input
              type="number"
              placeholder="Enter average age"
              value={avgAge}
              min={0}
              onChange={(e) => setAvgAge(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#2e9fd8] bg-white"
            />
          </div>

          {/* Average Salary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              What is their average monthly income (before tax)?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2e9fd8] font-bold text-sm">R</span>
              <select
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full border border-gray-300 rounded pl-8 pr-8 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#2e9fd8] appearance-none bg-white"
              >
                <option value="">Enter average salary</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              In which province are most of the employees based?
            </label>
            <div className="relative">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#2e9fd8] appearance-none bg-white pr-8"
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Which industry is your organization primarily in?
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#2e9fd8] appearance-none bg-white pr-8"
              >
                <option value="">Select industry</option>
                {industries.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* NEXT BUTTON */}
          <div className="flex justify-center mt-2">
            <button
              className="px-14 py-2.5 rounded text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: "#f5a623" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex gap-16 text-center text-sm text-gray-600 pb-10">
        <div>
          <div className="font-semibold text-gray-800">Call me back</div>
          <div className="text-gray-400 text-xs">We&apos;ll call you back within 5 minutes</div>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Call us on 021 045 1448</div>
          <div className="text-gray-400 text-xs">Call us any time during office hours</div>
        </div>
      </div>
    </div>
  );
}
