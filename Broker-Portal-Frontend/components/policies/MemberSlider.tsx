"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PolicyDetail, PolicyCover, Member } from "@/lib/types/policy";

const fmtR = (n: number) => `R ${n.toLocaleString("en-ZA")}`;

function LabelValue({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "13px", color: "var(--foreground)", fontWeight: 400 }}>{value}</p>
    </div>
  );
}

function CoverCard({ cover }: { cover: PolicyCover }) {
  return (
    <div style={{ border: "0.63px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "12px", background: "#242424" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>{cover.type}</p>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Policy No: {cover.policyNo}</p>
        </div>
        <Badge label={cover.status} type="status" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Cover per Employee</p>
          <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 500 }}>{fmtR(cover.coverPerEmployee)}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Employees Covered</p>
          <p style={{ fontSize: "13px", color: "var(--foreground)", fontWeight: 500 }}>{cover.employeesCovered}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Total Coverage</p>
          <p style={{ fontSize: "13px", color: "var(--foreground)", fontWeight: 500 }}>{fmtR(cover.totalCoverage)}</p>
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Monthly Premium</p>
          <p style={{ fontSize: "13px", color: "var(--foreground)", fontWeight: 500 }}>{fmtR(cover.monthlyPremium)}</p>
        </div>
      </div>
    </div>
  );
}

interface MemberSliderProps {
  member: Member | null;
  policy: PolicyDetail;
  onClose: () => void;
}

export default function MemberSlider({ member, policy, onClose }: MemberSliderProps) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"Details" | "Payments">("Details");

  useEffect(() => {
    if (member) {
      setTab("Details");
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [member]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!member) return null;

  const payStatuses: Array<"Paid" | "Failed" | "Pending"> = ["Paid","Paid","Failed","Paid","Paid","Paid","Failed","Paid","Paid","Paid","Paid","Pending"];
  const payments = Array.from({ length: 12 }, (_, i) => {
    const num = 12 - i;
    const year = num <= 4 ? "2026" : "2025";
    const day = String(5 + i).padStart(2, "0");
    return { id: `PAY-${member.id.replace("MEM-", "")}-${num}`, date: `05/${day}/${year}`, amount: member.premium, status: payStatuses[i] };
  });

  const tabBtn = (t: "Details" | "Payments") => {
    const isActive = tab === t;
    return (
      <button key={t} onClick={() => setTab(t)}
        style={{ padding: "6px 16px", borderRadius: "8px", border: isActive ? "1px solid var(--primary)" : "1px solid var(--border)", background: "transparent", color: isActive ? "var(--primary)" : "var(--foreground)", fontSize: "13px", fontWeight: isActive ? 500 : 400, cursor: "pointer", transition: "color 0.15s, border-color 0.15s", whiteSpace: "nowrap" }}
      >{t}</button>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.55)", opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }} />

      {/* Slider panel */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(520px, 100vw)", zIndex: 50, background: "#1E1E1E", borderLeft: "0.63px solid var(--border)", display: "flex", flexDirection: "column", transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", boxShadow: "-8px 0 32px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", flexShrink: 0 }}>
          <h2 style={{ fontSize: "17px", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{member.id}</h2>
          <button onClick={onClose}
            style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.10)", flexShrink: 0 }} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", padding: "16px 24px", flexShrink: 0 }}>
          {tabBtn("Details")}
          {tabBtn("Payments")}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
          {tab === "Details" && (
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)", marginBottom: "16px" }}>Policy Holder Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <LabelValue label="Name"          value={member.name} />
                <LabelValue label="Member ID"     value={member.id} />
                <LabelValue label="Email"         value={`${member.name.toLowerCase().replace(" ", "")}@gmail.com`} />
                <LabelValue label="Phone"         value="8282828233" />
              </div>
              <div style={{ borderTop: "0.63px solid var(--border)", marginBottom: "20px" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)", marginBottom: "16px" }}>Benefits</h3>
              {policy.covers.map((c, i) => <CoverCard key={i} cover={c} />)}
            </div>
          )}

          {tab === "Payments" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "0.63px solid var(--border)", background: "#3A3A3A80" }}>
                  {["Payment ID", "Date", "Amount", "Status"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id}
                    style={{ borderBottom: i < payments.length - 1 ? "0.63px solid rgba(255,255,255,0.06)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "10px 12px", color: "var(--foreground)", fontSize: "12px" }}>{p.id}</td>
                    <td style={{ padding: "10px 12px", color: "var(--foreground)" }}>{p.date}</td>
                    <td style={{ padding: "10px 12px", color: "var(--foreground)" }}>R {p.amount.toLocaleString("en-ZA")}</td>
                    <td style={{ padding: "10px 12px" }}><Badge label={p.status} type="payment" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
