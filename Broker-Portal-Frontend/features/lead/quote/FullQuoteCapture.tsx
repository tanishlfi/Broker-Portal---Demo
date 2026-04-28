"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import * as XLSX from "xlsx";


interface Employee {
  id: string;
  name: string;
  firstName: string;
  surname: string;
  gender: string;
  salary: string;
  income: string;
  dob: string;
  email: string;
  cellNumber: string;
  startDate: string;
  identification: string;
  passportExpiry: string;
  nationality: string;
  status: string;
}



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
  const [employees, setEmployees] = useState<Employee[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length > 0) {
          // Detect header row (contains "name", "first", or "income")
          const hasHeader = rows[0].some(
            (cell: any) =>
              typeof cell === "string" &&
              (cell.toLowerCase().includes("name") ||
                cell.toLowerCase().includes("first") ||
                cell.toLowerCase().includes("income"))
          );

          const dataRows = hasHeader ? rows.slice(1) : rows;

          const newEmployees: Employee[] = dataRows
            .filter((row) => row.length >= 4 && (row[0] || row[1]))
            .map((row) => {
              const firstName = String(row[0] || "").trim();
              const surname = String(row[1] || "").trim();
              const gender = String(row[2] || "").trim();
              const income = String(row[3] || "0").trim();
              const dob = String(row[4] || "").trim();
              const email = String(row[5] || "").trim();
              const cellNumber = String(row[6] || "").trim();
              const startDate = String(row[7] || "").trim();
              const identification = String(row[8] || "N/A").trim();
              const passportExpiry = String(row[9] || "").trim();
              const nationality = String(row[10] || "").trim();

              return {
                id: Math.random().toString(36).substr(2, 9),
                name: `${firstName} ${surname}`.trim() || "Unknown",
                firstName,
                surname,
                gender,
                salary: income,
                income,
                dob,
                email,
                cellNumber,
                startDate,
                identification,
                passportExpiry,
                nationality,
                status: "Active",
              };
            });
          setEmployees((prev) => [...prev, ...newEmployees]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };



  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
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
            <button
              onClick={() => {
                const newEmp: Employee = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: "John doe",
                  firstName: "John",
                  surname: "doe",
                  gender: "M",
                  salary: "343,234",
                  income: "343,234",
                  dob: "01/01/1980",
                  email: "john@example.com",
                  cellNumber: "0123456789",
                  startDate: "01/01/2020",
                  identification: "4324245",
                  passportExpiry: "01/01/2030",
                  nationality: "South Africa",
                  status: "Active",
                };

                setEmployees((prev) => [...prev, newEmp]);
              }}
              className="text-xs border border-[#555] text-gray-300 rounded px-3 py-1.5 hover:border-[#29abe2] hover:text-white transition-colors flex items-center gap-1.5"
            >
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

      {/* Employees Table */}
      {employees.length > 0 && (
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-8 py-7 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-sm font-semibold">Manually Added Employees ({employees.length})</h2>
            <button
              onClick={() => setEmployees([])}
              className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3a3a3a]">
                  <th className="pb-3 text-gray-100 text-xs font-semibold">Name</th>
                  <th className="pb-3 text-gray-100 text-xs font-semibold">ID/Passport</th>
                  <th className="pb-3 text-gray-100 text-xs font-semibold">Salary</th>
                  <th className="pb-3 text-gray-100 text-xs font-semibold">Status</th>
                  <th className="pb-3 text-gray-100 text-xs font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-[#3a3a3a] last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-gray-300 text-xs">{emp.name}</td>
                    <td className="py-3 text-gray-300 text-xs">{emp.identification}</td>
                    <td className="py-3 text-gray-300 text-xs">R {emp.salary}</td>
                    <td className="py-3">
                      <span className="text-gray-300 text-xs">
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => removeEmployee(emp.id)}
                        className="text-red-500/80 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



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
