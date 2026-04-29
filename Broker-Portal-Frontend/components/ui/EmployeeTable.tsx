"use client";

import { Trash2 } from "lucide-react";

export interface Employee {
  id: string;
  name: string;
  identification: string;
  salary: string;
  status: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function EmployeeTable({ employees, onRemove, onClearAll }: EmployeeTableProps) {
  if (employees.length === 0) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>
          Manually Added Employees ({employees.length})
        </h3>
        <button
          onClick={onClearAll}
          style={{ fontSize: "12px", color: "#a0a0a0", background: "none", border: "none", cursor: "pointer" }}
        >
          Clear All
        </button>
      </div>

      <div style={{ border: "1px solid #4a4a4a", borderRadius: "8px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#3a3a3a" }}>
              {["Name", "ID/Passport", "Salary", "Status"].map(h => (
                <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>
                  {h}
                </th>
              ))}
              <th style={{ padding: "8px 16px", textAlign: "right", fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={emp.id} style={{ borderTop: i === 0 ? "none" : "1px solid #4a4a4a" }}>
                <td style={{ padding: "8px 16px", fontSize: "14px", color: "#ffffff" }}>{emp.name}</td>
                <td style={{ padding: "8px 16px", fontSize: "14px", color: "#ffffff" }}>{emp.identification}</td>
                <td style={{ padding: "8px 16px", fontSize: "14px", color: "#ffffff" }}>R {emp.salary}</td>
                <td style={{ padding: "8px 16px" }}>
                  <span style={{ fontSize: "10px", color: "#ffffff", background: "transparent", border: "1px solid #4a4a4a", borderRadius: "9999px", padding: "2px 8px" }}>
                    {emp.status}
                  </span>
                </td>
                <td style={{ padding: "8px 16px", textAlign: "right" }}>
                  <button
                    onClick={() => onRemove(emp.id)}
                    style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: "6px", cursor: "pointer", color: "#ef4444", transition: "background 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
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
  );
}
