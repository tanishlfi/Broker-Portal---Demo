"use client";

import { useRef, useState } from "react";

interface FullQuoteCaptureProps {
  onBack: () => void;
  onGenerate: () => void;
}

const SCHEMES = [
  {
    name: "Basic Plan",
    benefits: [
      "Core medical coverage",
      "Standard life insurance",
      "Basic disability cover",
    ],
  },
  {
    name: "Comprehensive Plan",
    benefits: [
      "Extensive medical coverage",
      "Enhanced life insurance",
      "Full disability cover",
      "Family assistance",
    ],
  },
  {
    name: "Premium Plan",
    benefits: [
      "Global medical coverage",
      "Maximum life insurance",
      "Executive disability cover",
      "Family assistance & Wellness programs",
    ],
  },
];

export default function FullQuoteCapture({ onBack, onGenerate }: FullQuoteCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  };

  return (
    <div className="w-full max-w-[720px] flex flex-col gap-5">
      {/* Capture Employee Data */}
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-8 py-7 shadow-md">
        <h2 className="text-white text-sm font-semibold mb-1">Capture Employee Data</h2>
        <p className="text-gray-400 text-xs mb-5">
          Provide employee information via upload or manual entry to generate an accurate full quote.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Bulk Upload */}
          <div className="bg-[#303030] border border-[#444] rounded-lg p-5 flex flex-col items-center gap-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-white text-xs font-medium">Bulk Upload</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs border border-[#555] text-gray-300 rounded px-3 py-1.5 hover:border-[#29abe2] hover:text-white transition-colors w-full text-center"
            >
              {fileName ? fileName : "Choose file  No file chosen"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Manual Capture */}
          <div className="bg-[#303030] border border-[#444] rounded-lg p-5 flex flex-col items-center gap-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <span className="text-white text-xs font-medium">Manual Capture</span>
            <button className="text-xs border border-[#555] text-gray-300 rounded px-3 py-1.5 hover:border-[#29abe2] hover:text-white transition-colors flex items-center gap-1.5">
              <span className="text-lg leading-none">+</span> Add Individual Employee
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-[#1a2a3a] border border-[#29abe2]/30 rounded-md px-4 py-2.5 flex items-start gap-2">
          <svg className="w-4 h-4 text-[#29abe2] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-[#29abe2] text-xs">
            Required Quote Inputs: ID Type, DOB, and Salary are mandatory for each employee record.
          </p>
        </div>
      </div>

      {/* Available Schemes & Benefits */}
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-8 py-7 shadow-md">
        <h2 className="text-white text-sm font-semibold mb-4">Available Schemes &amp; Benefits</h2>
        <div className="grid grid-cols-3 gap-4">
          {SCHEMES.map((scheme) => (
            <div key={scheme.name} className="bg-[#303030] border border-[#444] rounded-lg p-4">
              <h3 className="text-[#29abe2] text-xs font-semibold mb-2">{scheme.name}</h3>
              <ul className="space-y-1">
                {scheme.benefits.map((b) => (
                  <li key={b} className="text-gray-400 text-xs flex gap-1.5">
                    <span className="text-gray-500">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-xs text-gray-300 border border-[#444] rounded px-4 py-2 hover:border-[#29abe2] hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={onGenerate}
          className="text-xs bg-[#29abe2] hover:bg-[#1a9fd6] text-white rounded px-5 py-2 font-medium transition-colors"
        >
          Generate Full Quote
        </button>
      </div>
    </div>
  );
}
