"use client";

import { useRef, useState } from "react";
import { Upload, Send, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import EmployeeTable from "@/components/ui/EmployeeTable";

interface Employee {
  id: string; name: string; firstName: string; surname: string;
  gender: string; salary: string; income: string; dob: string;
  email: string; cellNumber: string; startDate: string;
  identification: string; idType: string; passportExpiry: string;
  nationality: string; status: string;
}

interface FullQuoteCaptureProps {
  onBack: () => void;
  onGenerate: () => void;
}

const SCHEMES = [
  { name: "Basic Plan", benefits: ["Core medical coverage", "Standard life insurance", "Basic disability cover"] },
  { name: "Comprehensive Plan", benefits: ["Extensive medical coverage", "Enhanced life insurance", "Full disability cover", "Family assistance"] },
  { name: "Premium Plan", benefits: ["Global medical coverage", "Maximum life insurance", "Executive disability cover", "Family assistance & Wellness programs"] },
];

const EMPTY_FORM = { firstName: "", surname: "", dob: "", salary: "", idType: "SA ID", identification: "" };

const card: React.CSSProperties = {
  background: "#2d2d2d", border: "1px solid #4a4a4a", borderRadius: "8px", padding: "24px",
};

const btnOutline: React.CSSProperties = {
  height: "40px", padding: "0 20px", fontSize: "1rem", fontWeight: 500,
  background: "transparent", border: "1px solid #4a4a4a", color: "#ffffff",
  borderRadius: "6px", cursor: "pointer", transition: "background 0.15s",
};

const fieldInput: React.CSSProperties = {
  width: "100%", height: "40px", padding: "8px 12px", marginTop: "6px",
  background: "#3a3a3a", border: "2px solid #4a4a4a", borderRadius: "6px",
  fontSize: "0.875rem", color: "#ffffff", outline: "none", boxSizing: "border-box",
};

export default function FullQuoteCapture({ onBack, onGenerate }: FullQuoteCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer;
      if (!buf) return;
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rows.length) return;
      const hasHeader = rows[0].some((c: any) => typeof c === "string" && (c.toLowerCase().includes("name") || c.toLowerCase().includes("income")));
      const data = hasHeader ? rows.slice(1) : rows;
      setEmployees(prev => [...prev, ...data.filter(r => r.length >= 4 && (r[0] || r[1])).map(r => ({
        id: Math.random().toString(36).slice(2),
        name: `${r[0] || ""} ${r[1] || ""}`.trim() || "Unknown",
        firstName: String(r[0] || "").trim(), surname: String(r[1] || "").trim(),
        gender: String(r[2] || "").trim(), salary: String(r[3] || "0").trim(),
        income: String(r[3] || "0").trim(), dob: String(r[4] || "").trim(),
        email: String(r[5] || "").trim(), cellNumber: String(r[6] || "").trim(),
        startDate: String(r[7] || "").trim(), identification: String(r[8] || "N/A").trim(),
        idType: "SA ID", passportExpiry: String(r[9] || "").trim(),
        nationality: String(r[10] || "").trim(), status: "Active",
      }))]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddEmployee = () => {
    if (!form.firstName || !form.surname) return;
    setEmployees(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: `${form.firstName} ${form.surname}`.trim(),
      firstName: form.firstName, surname: form.surname, gender: "",
      salary: form.salary, income: form.salary, dob: form.dob,
      email: "", cellNumber: "", startDate: "",
      identification: form.identification, idType: form.idType,
      passportExpiry: "", nationality: "", status: "Active",
    }]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: "896px" }}>

      {/* Card 1 */}
      <div style={card}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", marginBottom: "16px" }}>
          Capture Employee Data
        </h2>
        <p style={{ fontSize: "14px", color: "#a0a0a0", marginBottom: "24px" }}>
          Provide employee information via upload or manual entry to generate an accurate full quote.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: fileName ? "16px" : "32px" }}>
          <div style={{ border: "2px dashed #4a4a4a", borderRadius: "8px", padding: "24px", textAlign: "center" }}>
            <Upload size={32} style={{ color: "#a0a0a0", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", marginBottom: "8px" }}>Bulk Upload</p>
            <button onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: "12px", border: "1px solid #4a4a4a", background: "transparent", color: "#a0a0a0", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
              {fileName ? "Replace file" : "Choose file"}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileChange} />
          </div>

          <div style={{ border: "2px dashed #4a4a4a", borderRadius: "8px", padding: "24px", textAlign: "center" }}>
            <Send size={32} style={{ color: "#a0a0a0", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", marginBottom: "8px" }}>Manual Capture</p>
            <button onClick={() => setShowForm(true)}
              style={{ fontSize: "12px", border: "1px solid #4a4a4a", background: "transparent", color: "#a0a0a0", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}>
              + Add Individual Employee
            </button>
          </div>
        </div>

        {fileName && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "16px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={20} style={{ color: "#22c55e", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#16a34a", margin: 0 }}>{fileName} uploaded</p>
              <p style={{ fontSize: "12px", color: "rgba(21,128,61,0.8)", margin: 0 }}>{employees.length} employees extracted</p>
            </div>
          </div>
        )}

        {showForm && (
          <div style={{
            background: "rgba(31,195,235,0.05)",
            border: "1px solid rgba(31,195,235,0.2)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>New Employee Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {([
                { label: "First Name", key: "firstName", placeholder: "John" },
                { label: "Surname", key: "surname", placeholder: "Doe" },
                { label: "Date of Birth", key: "dob", type: "date" },
                { label: "Salary (R)", key: "salary", placeholder: "25000", type: "number" },
              ] as { label: string; key: keyof typeof EMPTY_FORM; placeholder?: string; type?: string }[]).map(({ label, key, placeholder, type }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 500, color: "#ffffff" }}>{label}</label>
                  <input
                    type={type || "text"}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      height: "32px", fontSize: "12px", background: "#1a1a1a",
                      border: "2px solid #4a4a4a", borderRadius: "6px",
                      padding: "8px 12px", color: "#ffffff", width: "100%",
                      boxSizing: "border-box", outline: "none", colorScheme: "dark",
                    } as React.CSSProperties}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(31,195,235,0.5)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4a4a4a"; }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#1FC3EB";
                      e.currentTarget.style.boxShadow = "0 0 0 4px rgba(31,195,235,0.2)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "#4a4a4a";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#ffffff" }}>ID Type</label>
                <select
                  value={form.idType}
                  onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}
                  style={{
                    width: "100%", height: "32px", padding: "0 12px",
                    borderRadius: "6px", border: "1px solid #4a4a4a",
                    background: "#1a1a1a", fontSize: "12px", color: "#ffffff",
                    boxSizing: "border-box", outline: "none", colorScheme: "dark",
                  } as React.CSSProperties}
                >
                  <option value="SA ID">SA ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#ffffff" }}>ID/Passport Number</label>
                <input
                  type="text"
                  placeholder="ID Number"
                  value={form.identification}
                  onChange={e => setForm(f => ({ ...f, identification: e.target.value }))}
                  style={{
                    height: "32px", fontSize: "12px", background: "#1a1a1a",
                    border: "2px solid #4a4a4a", borderRadius: "6px",
                    padding: "8px 12px", color: "#ffffff", width: "100%",
                    boxSizing: "border-box", outline: "none", colorScheme: "dark",
                  } as React.CSSProperties}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(31,195,235,0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#4a4a4a"; }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "#1FC3EB";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(31,195,235,0.2)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "#4a4a4a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "8px" }}>
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                style={{ height: "32px", padding: "0 12px", fontSize: "14px", background: "transparent", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(31,195,235,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                style={{ height: "32px", padding: "0 12px", fontSize: "14px", fontWeight: 500, background: "#1FC3EB", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(31,195,235,0.9)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#1FC3EB"; }}
              >
                Add Employee
              </button>
            </div>
          </div>
        )}

        {employees.length > 0 && (
          <EmployeeTable
            employees={employees}
            onRemove={id => setEmployees(prev => prev.filter(e => e.id !== id))}
            onClearAll={() => setEmployees([])}
          />
        )}

        <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <AlertCircle size={14} style={{ color: "#3b82f6", flexShrink: 0, marginTop: "1px" }} />
          <p style={{ fontSize: "12px", color: "#3b82f6", margin: 0 }}>
            Required Quote Inputs: ID Type, DOB, and Salary are mandatory for each employee record.
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div style={{ ...card, marginTop: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", marginBottom: "16px" }}>
          Available Schemes &amp; Benefits
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {SCHEMES.map(scheme => (
            <div key={scheme.name} style={{ background: "rgba(58,58,58,0.5)", border: "1px solid #4a4a4a", borderRadius: "8px", padding: "16px" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1FC3EB", marginBottom: "8px" }}>{scheme.name}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                {scheme.benefits.map(b => (
                  <li key={b} style={{ fontSize: "14px", color: "#a0a0a0", display: "flex", gap: "6px" }}>
                    <span>•</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
        <button onClick={onBack} style={btnOutline}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#4a4a4a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          Back
        </button>
        <button onClick={onGenerate} disabled={employees.length === 0 && !fileName}
          style={{
            height: "40px", padding: "0 20px", fontSize: "1rem", fontWeight: 500,
            background: "#1FC3EB", color: "#ffffff", border: "none", borderRadius: "6px",
            cursor: employees.length === 0 && !fileName ? "not-allowed" : "pointer",
            opacity: employees.length === 0 && !fileName ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { if (employees.length > 0 || fileName) (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = employees.length === 0 && !fileName ? "0.5" : "1"; }}>
          Generate Full Quote
        </button>
      </div>
    </div>
  );
}
