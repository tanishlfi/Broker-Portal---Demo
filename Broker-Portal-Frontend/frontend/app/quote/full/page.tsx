"use client";

import { useState } from "react";

export default function FullQuotePage() {
  const [employedYes, setEmployedYes] = useState<string>("");
  const [activelyYes, setActivelyYes] = useState<string>("");
  const [replacingYes, setReplacingYes] = useState<string>("");
  const [province, setProvince] = useState("");
  const [industry, setIndustry] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [referral, setReferral] = useState("");

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ color: "#1a2e4a" }}>
          Let's get started on your full quote
        </h1>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-6">
          Please provide the info requested below
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded h-7 overflow-hidden mb-8">
          <div
            className="h-7 flex items-center justify-center text-white text-sm font-semibold rounded"
            style={{ width: "25%", backgroundColor: "#29abe2" }}
          >
            25%
          </div>
        </div>

        {/* Member number */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-1">
            Please enter your RMA member number so we can pre-fill your application and offer you additional products. If you're not an RMA member, please skip to the next question.
          </p>
          <p className="text-xs text-gray-400 mb-2">We will get your information from RMA and fill it.</p>
          <input
            type="text"
            placeholder="Member number or registration number."
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#29abe2] transition-colors"
          />
        </div>

        {/* Q1 */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Are all the employees you plan to cover permanently employed or on 6+ month contracts, legally employed in SA and working at least 20+ hours per week in SA?
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
            <input type="radio" name="employed" value="yes" checked={employedYes === "yes"} onChange={() => setEmployedYes("yes")} className="accent-[#29abe2]" />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="employed" value="no" checked={employedYes === "no"} onChange={() => setEmployedYes("no")} className="accent-[#29abe2]" />
            No
          </label>
        </div>

        {/* Q2 */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Are all the employees you plan to cover currently actively at work? I.e. they are attending to their normal work duties
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
            <input type="radio" name="actively" value="yes" checked={activelyYes === "yes"} onChange={() => setActivelyYes("yes")} className="accent-[#29abe2]" />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="actively" value="no" checked={activelyYes === "no"} onChange={() => setActivelyYes("no")} className="accent-[#29abe2]" />
            No
          </label>
        </div>

        {/* Province */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-2">In which province are most of the employees based?</p>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-500 outline-none focus:border-[#29abe2] transition-colors bg-white"
          >
            <option value="" disabled>Please select</option>
            <option>Gauteng</option>
            <option>Western Cape</option>
            <option>KwaZulu-Natal</option>
            <option>Eastern Cape</option>
            <option>Limpopo</option>
            <option>Mpumalanga</option>
            <option>North West</option>
            <option>Free State</option>
            <option>Northern Cape</option>
          </select>
        </div>

        {/* Industry */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-2">Which industry is your organisation primarily in?</p>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-500 outline-none focus:border-[#29abe2] transition-colors bg-white"
          >
            <option value="" disabled>Please select</option>
            <option>Agriculture</option>
            <option>Construction</option>
            <option>Education</option>
            <option>Finance</option>
            <option>Healthcare</option>
            <option>Manufacturing</option>
            <option>Mining</option>
            <option>Retail</option>
            <option>Technology</option>
            <option>Transport</option>
            <option>Other</option>
          </select>
        </div>

        {/* Q3 */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Is this policy replacing an existing policy or a very recently cancelled policy?
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer">
            <input type="radio" name="replacing" value="yes" checked={replacingYes === "yes"} onChange={() => setReplacingYes("yes")} className="accent-[#29abe2]" />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="replacing" value="no" checked={replacingYes === "no"} onChange={() => setReplacingYes("no")} className="accent-[#29abe2]" />
            No
          </label>
        </div>

        {/* Referral code */}
        <div className="mb-10">
          <p className="text-sm font-bold text-gray-800 mb-2">Referral code (if applicable)</p>
          <div className="flex">
            <input
              type="text"
              placeholder="Optional"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#29abe2] transition-colors"
            />
            <button
              className="px-6 py-3 text-white text-sm font-semibold rounded-r transition-colors"
              style={{ backgroundColor: "#29abe2" }}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            className="px-16 py-3 text-white font-semibold rounded text-sm transition-colors"
            style={{ backgroundColor: "#f5a623" }}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
