"use client";

import { Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export interface EmployeeRow {
  id: string;
  name: string;
  gender: string;
  salary: string;
  dob: string;
}

interface EmployeeListTableProps {
  employees: EmployeeRow[];
  onRemove: (id: string) => void;
}

export default function EmployeeListTable({ employees, onRemove }: EmployeeListTableProps) {
  if (employees.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Income</TableHead>
          <TableHead>Date of birth</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map(emp => (
          <TableRow key={emp.id}>
            <TableCell style={{ color: "#ffffff" }}>{emp.name}</TableCell>
            <TableCell style={{ color: "#d1d5db" }}>{emp.gender || "—"}</TableCell>
            <TableCell style={{ color: "#d1d5db" }}>{emp.salary || "—"}</TableCell>
            <TableCell style={{ color: "#d1d5db" }}>{emp.dob || "—"}</TableCell>
            <TableCell style={{ textAlign: "right" }}>
              <button
                onClick={() => onRemove(emp.id)}
                style={{
                  width: "28px", height: "28px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none", borderRadius: "4px",
                  cursor: "pointer", color: "#ef4444", transition: "background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Trash2 size={13} />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
