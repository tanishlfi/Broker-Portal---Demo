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
  idType: string;
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
    benefits: ["Core medical coverage", "Standard life insurance", "Basic disability cover"],
  },
  {
    name: "Comprehensive Plan",
    benefits: ["Extensive medical coverage", "Enhanced life insurance", "Full disability cover", "Family assistance"],
  },
  {
    name: "Premium Plan",
    benefits: ["Global medical coverage", "Maximum life insurance", "Executive disability cover", "Family assistance & Wellness programs"],
  },
];

const EMPTY_FORM = { firstName: "", surname: "", dob: "", salary: "", idType: "SA ID", identification: "" };

export default function FullQuoteCapture({ onBack, onGenerate }: FullQuoteCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rows.length > 0) {
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
              const income = String(row[3] || "0").trim();
              return {
                id: Math.random().toString(36).substring(2, 11),
                name: `${firstName} ${surname}`.trim() || "Unknown",
                firstName,
                surname,
                gender: String(row[2] || "").trim(),
                salary: income,
                income,
                dob: String(row[4] || "").trim(),
                email: String(row[5] || "").trim(),
                cellNumber: String(row[6] || "").trim(),
                startDate: String(row[7] || "").trim(),
                identification: String(row[8] || "N/A").trim(),
                idType: "SA ID",
                passportExpiry: String(row[9] || "").trim(),
                nationality: String(row[10] || "").trim(),
                status: "Active",
              };
            });
          setEmployees((prev) => [...prev, ...newEmployees]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleAddEmployee = () => {
    if (!form.firstName || !form.surname) return;
    const newEmp: Employee = {
      id: Math.random().toString(36).substring(2, 11),
      name: `${form.firstName} ${form.surname}`.trim(),
      firstName: form.firstName,
      surname: form.surname,
      gender: "",
      salary: form.salary,
      income: form.salary,
      dob: form.dob,
      email: "",
      cellNumber: "",
      startDate: "",
      identification: form.identification,
      idType: form.idType,
      passportExpiry: "",
      nationality: "",
      status: "Active",
    };
    setEmployees((prev) => [...prev, newEmp]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const inputCls = "w-full bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-gray-200 text-xs placeholder-gray-500 focus:outline-none focus:border-[#29abe2]";

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
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Manual Capture */}
          <div className="bg-[#303030] border border-[#444] rounded-lg p-5 flex flex-col items-center gap-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <span className="text-white text-xs font-medium">Manual Capture</span>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs border border-[#555] text-gray-300 rounded px-3 py-1.5 hover:border-[#29abe2] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> Add Individual Employee
            </button>
          </div>
        </div>

        {/* Inline Add Employee Form */}
        {showForm && (
          <div className="mb-5">
            <h3 className="text-white text-xs font-semibold mb-3">New Employee Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-[11px]">First Name</label>
                <input
                  className={inputCls}
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-[11px]">Surname</label>
                <input
                  className={inputCls}
                  placeholder="Doe"
                  value={form.surname}
                  onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-[11px]">Date of Birth</label>
                <input
                  type="date"
                  className={`${inputCls} [color-scheme:dark]`}
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-[11px]">Salary (R)</label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  className={`${inputCls} [color-scheme:dark] show-spinner`}
                  placeholder="25000"
                  value={form.salary}
                  onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-[11px]">ID Type</label>
                <select
                  className={inputCls}
                  value={form.idType}
                  onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value }))}
                >
                  <option value="SA ID">SA ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-[11px]">ID/Passport Number</label>
                <input
                  className={inputCls}
                  placeholder="ID Number"
                  value={form.identification}
                  onChange={(e) => setForm((f) => ({ ...f, identification: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="text-xs text-gray-400 border border-[#444] rounded px-4 py-1.5 hover:border-[#555] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="text-xs bg-[#29abe2] hover:bg-[#1a9fd6] text-white rounded px-4 py-1.5 font-medium transition-colors"
              >
                Add Employee
              </button>
            </div>
          </div>
        )}

        {/* Employees Table — inside the same card */}
        {employees.length > 0 && (
          <div className="mt-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white text-xs font-semibold">Manually Added Employees ({employees.length})</h3>
              <button onClick={() => setEmployees([])} className="text-[10px] text-gray-400 hover:text-red-400 transition-colors">
                Clear All
              </button>
            </div>
            <div className="rounded-lg border border-[#3a3a3a] overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#222] border-b border-[#3a3a3a]">
                    <th className="px-4 py-2.5 text-gray-400 text-xs font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-gray-400 text-xs font-semibold">ID/Passport</th>
                    <th className="px-4 py-2.5 text-gray-400 text-xs font-semibold">Salary</th>
                    <th className="px-4 py-2.5 text-gray-400 text-xs font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-gray-400 text-xs font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-[#3a3a3a] last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-0 pr-3" title={emp.name}>{emp.name}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-0 pr-3">{emp.identification}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs truncate max-w-0 pr-3">R {emp.salary}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-xs border border-[#555] rounded-full px-2.5 py-0.5">{emp.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeEmployee(emp.id)} className="text-red-500/80 hover:text-red-500 transition-colors">
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

        {/* Info banner */}
        <div className={`bg-[#1a2a3a] border border-[#29abe2]/30 rounded-md px-4 py-2.5 flex items-start gap-2 ${employees.length > 0 || showForm ? "mt-4" : ""}`}>
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
        <button onClick={onBack} className="text-xs text-gray-300 border border-[#444] rounded px-4 py-2 hover:border-[#29abe2] hover:text-white transition-colors">
          Back
        </button>
        <button onClick={onGenerate} className="text-xs bg-[#29abe2] hover:bg-[#1a9fd6] text-white rounded px-5 py-2 font-medium transition-colors">
          Generate Full Quote
        </button>
      </div>
    </div>
  );
}
