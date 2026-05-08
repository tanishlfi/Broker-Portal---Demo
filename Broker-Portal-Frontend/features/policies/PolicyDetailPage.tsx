"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PolicyDetail, PolicyCover, Member } from "@/lib/types/policy";
import MemberSlider from "../../components/policies/MemberSlider";

// ── Mock data (same as PoliciesPage) ─────────────────────────────────────────

export const MOCK_DETAILS: Record<string, PolicyDetail> = {
  "POL-2026-081": {
    policyNumber: "POL-2026-081", companyName: "Medical Care Group",
    registrationNumber: "2737182", industry: "Healthcare",
    numberOfEmployees: 343, address: "Western Cape, Johannesburg, 4444",
    contactPerson: "John Doe", position: "General HR Manager",
    email: "johndoe@gmail.com", phone: "8282828233",
    covers: [
      { type: "Group Life Cover", policyNo: "GLP-2024-5678", coverPerEmployee: 500000, employeesCovered: 250, totalCoverage: 125000000, monthlyPremium: 212500, status: "Active" },
      { type: "Funeral Cover",    policyNo: "GLP-2024-5678", coverPerEmployee: 500000, employeesCovered: 250, totalCoverage: 125000000, monthlyPremium: 212500, status: "Active" },
      { type: "Accident Fund",    policyNo: "GLP-2024-5678", coverPerEmployee: 500000, employeesCovered: 250, totalCoverage: 125000000, monthlyPremium: 212500, status: "Active" },
    ],
  },
  "POL-2026-082": {
    policyNumber: "POL-2026-082", companyName: "FinServe Financial Solutions",
    registrationNumber: "1995/654321/07", industry: "Finance",
    numberOfEmployees: 520, address: "Sandton, Johannesburg, 2196",
    contactPerson: "Sarah Nkosi", position: "HR Director",
    email: "sarah@finserve.co.za", phone: "0112345678",
    covers: [
      { type: "Group Life Cover", policyNo: "GLP-2024-0082", coverPerEmployee: 750000, employeesCovered: 520, totalCoverage: 95000000, monthlyPremium: 23750, status: "Active" },
    ],
  },
  "POL-2025-089": {
    policyNumber: "POL-2025-089", companyName: "Tech Innovations Pty Ltd",
    registrationNumber: "2008/445566/07", industry: "Technology",
    numberOfEmployees: 180, address: "Century City, Cape Town, 7441",
    contactPerson: "Ravi Pillay", position: "People Operations Lead",
    email: "ravi@techinnovations.co.za", phone: "0219876543",
    covers: [
      { type: "Group Life Cover", policyNo: "GLP-2025-0089", coverPerEmployee: 600000, employeesCovered: 180, totalCoverage: 85000000, monthlyPremium: 21250, status: "Active" },
      { type: "Funeral Cover",    policyNo: "GLP-2025-0089", coverPerEmployee: 50000,  employeesCovered: 180, totalCoverage: 9000000,  monthlyPremium: 4500,  status: "Active" },
    ],
  },
  "POL-2025-067": {
    policyNumber: "POL-2025-067", companyName: "Retail Excellence Ltd",
    registrationNumber: "2010/987654/07", industry: "Retail",
    numberOfEmployees: 890, address: "Durban, KwaZulu-Natal, 4001",
    contactPerson: "Thandi Mokoena", position: "HR Manager",
    email: "thandi@retailexcellence.co.za", phone: "0317654321",
    covers: [
      { type: "Group Life Cover", policyNo: "GLP-2025-0067", coverPerEmployee: 400000, employeesCovered: 890, totalCoverage: 178000000, monthlyPremium: 44500, status: "Active" },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtR = (n: number) => `R ${n.toLocaleString("en-ZA")}`;

function LabelValue({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "13px", color: "var(--foreground)", fontWeight: 400 }}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)", marginBottom: "16px" }}>{title}</h3>
      {children}
      <div style={{ borderTop: "0.63px solid var(--border)", marginTop: "20px" }} />
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
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

// ── Member types ──────────────────────────────────────────────────────────────

export function buildMembers(policy: PolicyDetail): Member[] {
  return Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const premium = 15000 + ((i * 3731) % 35000);
    const day = String(1 + (i * 7) % 28).padStart(2, "0");
    const month = String(4 + (i % 2)).padStart(2, "0");
    return {
      id: `MEM-${policy.policyNumber.replace("POL-", "")}-${num}`,
      name: `Employee ${num}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      premium,
      lastPayment: `${day}/0${month}/2026`,
    };
  });
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = ["Details", "Policy Documents", "Members", "Payments"] as const;
type Tab = typeof TABS[number];

// ── Tab: Details ──────────────────────────────────────────────────────────────

function DetailsTab({ policy }: { policy: PolicyDetail }) {
  return (
    <div>
      <Section title="Employer Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
          <LabelValue label="Company Name"        value={policy.companyName} />
          <LabelValue label="Registration Number" value={policy.registrationNumber} />
          <LabelValue label="Industry"            value={policy.industry} />
          <LabelValue label="Number of Employees" value={policy.numberOfEmployees} />
        </div>
        <LabelValue label="Address" value={policy.address} />
      </Section>
      <Section title="Contact Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <LabelValue label="Contact Person" value={policy.contactPerson} />
          <LabelValue label="Position"       value={policy.position} />
          <LabelValue label="Email"          value={policy.email} />
          <LabelValue label="Phone"          value={policy.phone} />
        </div>
      </Section>
      <div>
        {policy.covers.map((c, i) => <CoverCard key={i} cover={c} />)}
      </div>
    </div>
  );
}

// ── Tab: Policy Documents ─────────────────────────────────────────────────────

function PolicyDocumentsTab() {
  const docs = ["Master Policy Document", "Policy Schedule", "Employee Benefits Guide"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {docs.map((doc) => (
        <div key={doc} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "#242424", border: "0.63px solid var(--border)", borderRadius: "10px" }}>
          <span style={{ fontSize: "14px", color: "var(--foreground)" }}>{doc}</span>
          <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: "6px", background: "#1FC3EB", border: "none", color: "#000", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Members ──────────────────────────────────────────────────────────────

function MembersTab({ policy, onSelectMember }: { policy: PolicyDetail; onSelectMember: (m: Member) => void }) {
  const [search, setSearch] = useState("");
  const members = buildMembers(policy);
  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
        <input
          type="text" placeholder="Search by name or member id..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "400px", height: "38px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", padding: "0 12px 0 34px", fontSize: "13px", color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>
      <div style={{ border: "0.63px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "0.63px solid var(--border)", background: "#3A3A3A80" }}>
              {["Member ID", "Name", "Gender", "Monthly Premium", "Last Payment"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id}
                style={{ borderBottom: i < filtered.length - 1 ? "0.63px solid rgba(255,255,255,0.06)" : "none", transition: "background 0.15s", cursor: "pointer" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", color: "var(--primary)", whiteSpace: "nowrap", fontSize: "12px", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                  onClick={() => onSelectMember(m)}>{m.id}</td>
                <td style={{ padding: "12px 16px", color: "var(--foreground)", whiteSpace: "nowrap" }}>{m.name}</td>
                <td style={{ padding: "12px 16px", color: "var(--foreground)", whiteSpace: "nowrap" }}>{m.gender}</td>
                <td style={{ padding: "12px 16px", color: "var(--foreground)", whiteSpace: "nowrap" }}>R {m.premium.toLocaleString("en-ZA")}</td>
                <td style={{ padding: "12px 16px", color: "var(--foreground)", whiteSpace: "nowrap" }}>{m.lastPayment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Payments ─────────────────────────────────────────────────────────────

function PaymentsTab({ policy }: { policy: PolicyDetail }) {
  const [search, setSearch] = useState("");
  const statuses: Array<"Paid" | "Failed" | "Pending"> = ["Paid","Paid","Failed","Paid","Paid","Paid","Failed","Paid","Paid","Paid","Paid","Pending"];
  const payments = Array.from({ length: 12 }, (_, i) => {
    const num = 12 - i;
    const year = num <= 4 ? "2026" : "2025";
    const day = String(5 + i).padStart(2, "0");
    return { id: `PAY-${policy.policyNumber.replace("POL-", "")}-${num}`, date: `05/${day}/${year}`, amount: policy.covers[0]?.monthlyPremium ?? 0, status: statuses[i] };
  });
  const filtered = payments.filter((p) => !search || p.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }} />
        <input type="text" placeholder="Search by payment id..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "400px", height: "38px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--input)", padding: "0 12px 0 34px", fontSize: "13px", color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>
      <div style={{ border: "0.63px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "0.63px solid var(--border)", background: "#3A3A3A80" }}>
              {["Payment ID", "Date", "Amount", "Status"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id}
                style={{ borderBottom: i < filtered.length - 1 ? "0.63px solid rgba(255,255,255,0.06)" : "none", transition: "background 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 16px", color: "var(--foreground)", fontSize: "12px" }}>{p.id}</td>
                <td style={{ padding: "12px 16px", color: "var(--foreground)" }}>{p.date}</td>
                <td style={{ padding: "12px 16px", color: "var(--foreground)" }}>R {p.amount.toLocaleString("en-ZA")}</td>
                <td style={{ padding: "12px 16px" }}><Badge label={p.status} type="payment" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

export default function PolicyDetailPage({ policyId }: { policyId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam && TABS.includes(tabParam as Tab) ? tabParam as Tab : "Details");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (tabParam && TABS.includes(tabParam as Tab)) {
      setActiveTab(tabParam as Tab);
    }
  }, [tabParam]);

  const policy = MOCK_DETAILS[policyId];

  if (!policy) {
    return (
      <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", paddingTop: "40px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
          Policy not found.
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <button
              onClick={() => router.back()}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "13px", padding: 0 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <span style={{ color: "var(--border)" }}>/</span>
            <h1 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
              {policy.companyName} — {policy.policyNumber}
            </h1>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "6px 16px", borderRadius: "8px", border: isActive ? "1px solid var(--primary)" : "1px solid var(--border)", background: "transparent", color: isActive ? "var(--primary)" : "var(--foreground)", fontSize: "13px", fontWeight: isActive ? 500 : 400, cursor: "pointer", transition: "color 0.15s, border-color 0.15s", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = "rgba(31,195,235,0.4)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === "Details"          && <DetailsTab policy={policy} />}
          {activeTab === "Policy Documents" && <PolicyDocumentsTab />}
          {activeTab === "Members"          && <MembersTab policy={policy} onSelectMember={setSelectedMember} />}
          {activeTab === "Payments"         && <PaymentsTab policy={policy} />}

        </div>
      </main>

      {/* Member slider */}
      <MemberSlider member={selectedMember} policy={policy} onClose={() => setSelectedMember(null)} />
    </>
  );
}
