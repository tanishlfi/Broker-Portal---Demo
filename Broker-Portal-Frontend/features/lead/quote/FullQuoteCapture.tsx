"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import EmployeeListTable from "@/components/ui/EmployeeListTable";
import { BackButton, NextButton } from "@/components/ui/StepButtons";
import DownloadQuoteModal from "@/components/ui/DownloadQuoteModal";
import StepProgress from "@/components/ui/StepProgress";
import {
  validateRequired,
  validatePositiveNumber,
  validatePositiveDecimal,
} from "@/utils/validators";
import { getProductList, calculatePricing, type Product } from "../../../lib/api/products";

interface Employee {
  id: string; name: string; firstName: string; surname: string;
  gender: string; salary: string; income: string; dob: string;
  email: string; cellNumber: string; startDate: string;
  identification: string; idType: string; passportExpiry: string;
  nationality: string; status: string;
}

interface FullQuoteCaptureProps {
  companyName?: string;
  leadReference?: string;
  quickQuoteData?: any;
  quoteReference?: string;
  onBack: () => void;
  onGenerate: (data: any) => Promise<any>;
}

// ── shared styles ──────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem", fontWeight: 400, color: "#9ca3af", display: "block", marginBottom: "6px",
};

const inputBase: React.CSSProperties = {
  height: "40px", width: "100%", padding: "0 12px",
  background: "#2a2a2a", border: "1px solid #30363D", borderRadius: "6px",
  fontSize: "0.875rem", color: "#ffffff", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
};

const selectBase: React.CSSProperties = {
  ...inputBase,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px", cursor: "pointer",
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#1FC3EB";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31,195,235,0.15)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#30363D";
  e.currentTarget.style.boxShadow = "none";
}
function onMouseEnter(e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) {
  if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = "rgba(31,195,235,0.5)";
}
function onMouseLeave(e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) {
  if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = "#30363D";
}

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];
const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];
const SCHEMES = ["Scheme A", "Scheme B", "Scheme C"];
const BENEFITS = ["Basic", "Standard", "Comprehensive"];
const VAS_OPTIONS = ["None", "Wellness Programme", "EAP", "Funeral Cover"];

const STEPS = ["Quote Details", "Employee Information", "Cover Adjustments"];

const EMPTY_FORM = { firstName: "", surname: "", dob: "", salary: "", idType: "SA ID", identification: "" };

// ── Quote Preview Step Component ────────────────────────────────────────────

interface QuotePreviewProps {
  companyName: string;
  registrationNumber: string;
  employeeCount: number;
  averageAge: string;
  averageIncome: string;
  genderSplit: string;
  province: string;
  industry: string;
}

function QuotePreviewStep({ companyName, registrationNumber, employeeCount, averageAge, averageIncome, genderSplit, province, industry }: QuotePreviewProps) {
  const monthlyPremium = 13310;
  const coverageAmount = 14400000;
  const deductible = 40000;
  const lifeCover = 0.5;
  const funeralCover = 20000;

  const fmt = (v: number) => "R " + v.toLocaleString("en-ZA", { minimumFractionDigits: 2 });

  const sectionHeading: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 600, color: "#1FC3EB",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px",
  };
  const fieldLabel: React.CSSProperties = { fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" };
  const fieldValue: React.CSSProperties = { fontSize: "0.8125rem", color: "#ffffff", fontWeight: 500 };
  const divider: React.CSSProperties = { borderTop: "1px solid #30363D", margin: "12px 0" };

  return (
    <div style={{
      background: "#1E1E1E", border: "0.63px solid #30363D", borderRadius: "10px",
      padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff" }}>Quote Details</span>
        <button style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", color: "#9ca3af", fontSize: "0.8125rem", cursor: "pointer" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Download
        </button>
      </div>

      <div style={divider} />

      {/* Company Details */}
      <div>
        <p style={sectionHeading}>Company Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><p style={fieldLabel}>Company Name</p><p style={fieldValue}>{companyName}</p></div>
          <div><p style={fieldLabel}>Registration Number</p><p style={fieldValue}>{registrationNumber}</p></div>
        </div>
      </div>

      <div style={divider} />

      {/* Quote Details */}
      <div>
        <p style={sectionHeading}>Quote Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "10px" }}>
          <div><p style={fieldLabel}>Employees Covered</p><p style={fieldValue}>{employeeCount}</p></div>
          <div><p style={fieldLabel}>Average Age</p><p style={fieldValue}>{averageAge}</p></div>
          <div><p style={fieldLabel}>Average Income</p><p style={fieldValue}>{averageIncome}</p></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div><p style={fieldLabel}>Gender Split</p><p style={fieldValue}>{genderSplit}</p></div>
          <div><p style={fieldLabel}>Province</p><p style={fieldValue}>{province}</p></div>
          <div><p style={fieldLabel}>Industry</p><p style={fieldValue}>{industry}</p></div>
        </div>
      </div>

      <div style={divider} />

      {/* Premium Details */}
      <div>
        <p style={sectionHeading}>Premium Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div><p style={fieldLabel}>Estimated Monthly Premium</p><p style={{ ...fieldValue, color: "#1FC3EB", fontSize: "1rem" }}>{fmt(monthlyPremium)}</p></div>
          <div><p style={fieldLabel}>Total Coverage Amount</p><p style={fieldValue}>{fmt(coverageAmount)}</p></div>
          <div><p style={fieldLabel}>Deductible</p><p style={fieldValue}>{fmt(deductible)}</p></div>
        </div>
      </div>

      <div style={divider} />

      {/* Coverage Details */}
      <div>
        <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>Coverage Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#2a2a2a", border: "1px solid #30363D", borderRadius: "8px", padding: "14px" }}>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "4px" }}>Life Cover</p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>R {lifeCover}x monthly salary</p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Avg of R 9,000.00 per employee</p>
          </div>
          <div style={{ background: "#2a2a2a", border: "1px solid #30363D", borderRadius: "8px", padding: "14px" }}>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "4px" }}>Funeral Cover</p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>R {funeralCover.toLocaleString("en-ZA")}</p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>per employee</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Adjust Cover Step Component ──────────────────────────────────────────────

interface AdjustCoverStepProps {
  employeeCount: number;
  averageIncome: number;
  lifeCover: number;
  setLifeCover: (v: number) => void;
  occupationalDisability: number;
  setOccupationalDisability: (v: number) => void;
  funeralCover: number;
  setFuneralCover: (v: number) => void;
  additionalBenefits: any;
  setAdditionalBenefits: (v: any) => void;
  province: string;
  industry: string;
  averageAge: string;
  setProductId?: (id: string) => void;
}

function AdjustCoverStep({
  employeeCount,
  averageIncome,
  lifeCover,
  setLifeCover,
  occupationalDisability,
  setOccupationalDisability,
  funeralCover,
  setFuneralCover,
  additionalBenefits,
  setAdditionalBenefits,
  province,
  industry,
  averageAge,
  setProductId,
}: AdjustCoverStepProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalMonthlyPremium, setTotalMonthlyPremium] = useState(0);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [benefitBreakdown, setBenefitBreakdown] = useState<any[]>([]);

  const { augmentation, commutingJourney, riotAndStrike, comprehensivePersonalAccident, classicPersonalAccident } = additionalBenefits;

  useEffect(() => {
    getProductList().then(data => {
      setProducts(data);
      if (data.length > 0 && setProductId) {
        setProductId(data[0].product_id);
      }
      data.forEach(p => {
        p.benefits.forEach(b => {
          const type = b.benefit_type.toUpperCase();
          if (type === "LIFE" && b.default_cover_amount) {
            setLifeCover(1.5);
          } else if (type === "ACCIDENT" || type === "OCCUPATIONAL DISABILITY") {
            setOccupationalDisability(2.5);
          } else if (type === "FUNERAL" && b.default_cover_amount) {
            setFuneralCover(b.default_cover_amount);
          }
        });
      });
    }).catch(console.error);
  }, [setLifeCover, setOccupationalDisability, setFuneralCover]);

  const updatePricing = useCallback(async () => {
    if (products.length === 0) return;
    setIsPricingLoading(true);
    try {
      const payload = {
        quote_type: "Full",
        member_count: employeeCount || 1,
        quick_quote_data: {
          workforce_count: employeeCount || 1,
          average_age: parseInt(averageAge, 10) || 35,
          average_salary: averageIncome || 0,
          province: province,
          industry: industry,
        },
        benefits: products.flatMap(p =>
          p.benefits.map((b: any) => {
            let isSelected = false;
            let coverAmount = 0;
            let multiple = 0;

            const type = b.benefit_type.toUpperCase();
            if (type === "LIFE") {
              isSelected = true;
              multiple = lifeCover;
            } else if (type === "ACCIDENT" || type === "OCCUPATIONAL DISABILITY") {
              isSelected = true;
              multiple = occupationalDisability;
            } else if (type === "FUNERAL") {
              isSelected = true;
              coverAmount = funeralCover;
            } else if (type === "VAPS") {
              if (b.benefit_name.includes("Augmentation")) isSelected = augmentation;
              if (b.benefit_name.includes("Commuting")) isSelected = commutingJourney;
              if (b.benefit_name.includes("Riot")) isSelected = riotAndStrike;
              if (b.benefit_name.includes("Personal Accident")) {
                if (b.benefit_name.includes("Comprehensive")) isSelected = comprehensivePersonalAccident;
                else isSelected = classicPersonalAccident;
              }
              coverAmount = b.default_cover_amount || 0;
            }

            return {
              benefit_id: b.benefit_id,
              benefit_type: b.benefit_type,
              cover_amount: coverAmount,
              multiple: multiple > 0 ? multiple : undefined,
              is_selected: isSelected
            };
          })
        )
      };

      const res = await calculatePricing(payload as any);
      setTotalMonthlyPremium(res?.data?.total_premium ?? res?.data?.total_monthly_premium ?? 0);
      if (res?.data?.benefits) {
        setBenefitBreakdown(res.data.benefits);
      }
    } catch (error) {
      console.error("Pricing calculation failed:", error);
    } finally {
      setIsPricingLoading(false);
    }
  }, [lifeCover, funeralCover, occupationalDisability, additionalBenefits, employeeCount, products, province, industry, averageIncome, averageAge]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePricing();
    }, 500);
    return () => clearTimeout(timer);
  }, [updatePricing]);

  const setBenefit = (key: string, value: boolean) => {
    setAdditionalBenefits((prev: any) => ({ ...prev, [key]: value }));
  };

  const coverItems = [
    { name: "Life", amount: 50 },
    { name: "Occupational Disability", amount: 24 },
    { name: "Funeral", amount: 24 },
    ...(augmentation ? [{ name: "Augmentation", amount: 24 }] : []),
    ...(commutingJourney ? [{ name: "Commuting Journey Policy with Crime", amount: 24 }] : []),
    ...(riotAndStrike ? [{ name: "Riot and Strike", amount: 24 }] : []),
    ...(classicPersonalAccident ? [{ name: "Classic Personal Accident", amount: 24 }] : []),
    ...(comprehensivePersonalAccident ? [{ name: "Comprehensive Personal Accident", amount: 24 }] : []),
  ];

  const costPerMember = totalMonthlyPremium / Math.max(employeeCount, 1);
  const fmt = (v: number) => "R" + v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sliderCard: React.CSSProperties = {
    background: "#1B1B1B",
    border: "1px solid #2B3138",
    borderRadius: "10px",
    padding: "12px 14px",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "14px", position: "relative" }}>
      {isPricingLoading && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "10px", zIndex: 100
        }}>
          <div style={{ width: "30px", height: "30px", border: "2px solid #1FC3EB", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div style={{ background: "#1E1E1E", border: "1px solid #273444", borderRadius: "10px", padding: "12px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button style={{ padding: "6px 10px", background: "#2C3239", border: "1px solid #3A4149", borderRadius: "6px", color: "#E5E7EB", fontSize: "0.72rem", cursor: "pointer" }}>Multiple of Salary</button>
          <button style={{ padding: "6px 10px", background: "transparent", border: "1px solid #3A4149", borderRadius: "6px", color: "#9CA3AF", fontSize: "0.72rem", cursor: "pointer" }}>Equal Amount</button>
        </div>

        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>Adjust Cover Amounts</h3>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "14px" }}>
          For an average of <span style={{ color: "#1FC3EB", fontWeight: 600 }}>R{averageIncome.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> per employee p/m,
          each one would get:
        </p>

        <div style={{ ...sliderCard, marginBottom: "10px" }}>
          <label style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500, display: "block", marginBottom: "8px" }}>
            Life cover - {lifeCover}x annual salary (max R2M)
          </label>
          <input type="range" min="0.5" max="5" step="0.5" value={lifeCover} onChange={e => setLifeCover(Number(e.target.value))} className="adjust-slider" style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: "4px" }}>
            <span>0.5x annual salary</span>
            <span>5x Annual Salary</span>
          </div>
          <ul style={{ fontSize: "0.67rem", color: "#9ca3af", margin: "8px 0 0 0", paddingLeft: "16px" }}>
            <li>0.19% of salary up to a max of R317 per employee p/m*</li>
            <li>1 employee will be added monthly to check if they qualify for full cover.</li>
            <li>1 employees has reached the max cover limit of R2M.</li>
          </ul>
        </div>

        <div style={{ ...sliderCard, marginBottom: "10px" }}>
          <label style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500, display: "block", marginBottom: "8px" }}>
            Occupational Disability cover - {occupationalDisability}x annual salary (max R2M)
          </label>
          <input type="range" min="0.5" max="5" step="0.5" value={occupationalDisability} onChange={e => setOccupationalDisability(Number(e.target.value))} className="adjust-slider" style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: "4px" }}>
            <span>0.5x annual salary</span>
            <span>5x Annual Salary</span>
          </div>
          <ul style={{ fontSize: "0.67rem", color: "#9ca3af", margin: "8px 0 0 0", paddingLeft: "16px" }}>
            <li>0.19% of salary up to a max of R869 per employee p/m*</li>
            <li>1 employee will be added monthly to check if they qualify for full cover.</li>
            <li>1 employees has reached the max cover limit of R2M.</li>
          </ul>
        </div>

        <div style={{ ...sliderCard, marginBottom: "12px" }}>
          <label style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500, display: "block", marginBottom: "8px" }}>Funeral cover - R{funeralCover.toLocaleString("en-ZA")}</label>
          <input type="range" min="5000" max="50000" step="1000" value={funeralCover} onChange={e => setFuneralCover(Number(e.target.value))} className="adjust-slider" style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: "4px" }}>
            <span>R5,000</span>
            <span>R50,000</span>
          </div>
        </div>

        <h4 style={{ fontSize: "0.86rem", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>Additional Benefits</h4>

        {[
          {
            label: "Augmentation - monthly income, up to 75% of earnings above the COIDA limits",
            active: augmentation,
            onToggle: (v: boolean) => setBenefit("augmentation", v),
            notes: ["Cover for death and disability for those employees earning above the COIDA limit of R563 520 (per annum)", "R860 per employee p/m (all employees qualify)"],
          },
          {
            label: "Commuting Journey Policy with Crime - monthly income, up to 75% of earnings",
            active: commutingJourney,
            onToggle: (v: boolean) => setBenefit("commutingJourney", v),
            notes: ["Cover for death and disability occurring from an accident while travelling to and from work including cover for a crime-related accident", "R350 per employee p/m (all employees qualify)"],
          },
          {
            label: "Riot and Strike - 2 x annual salary",
            active: riotAndStrike,
            onToggle: (v: boolean) => setBenefit("riotAndStrike", v),
            notes: ["Cover for injuries and death arising from riots and strikes", "R90 per employee p/m (all employees qualify)"],
          },
          {
            label: "Comprehensive Personal Accident - up to 4 x annual salary",
            active: comprehensivePersonalAccident,
            onToggle: (v: boolean) => setBenefit("comprehensivePersonalAccident", v),
            notes: ["Covers accidents that result in death, temporary, permanent disability and medical expenses", "R1,430 per employee p/m (all employees qualify)"],
          },
          {
            label: "Classic Personal Accident - up to 4 x annual salary",
            active: classicPersonalAccident,
            onToggle: (v: boolean) => setBenefit("classicPersonalAccident", v),
            notes: [],
          },
        ].map((benefit) => (
          <div key={benefit.label} style={{ marginBottom: "12px" }}>
            <label style={{ display: "flex", gap: "8px", cursor: "pointer", marginBottom: "6px" }}>
              <input type="checkbox" checked={benefit.active} onChange={e => benefit.onToggle(e.target.checked)} style={{ marginTop: "2px", accentColor: "#1FC3EB" }} />
              <span style={{ fontSize: "0.72rem", color: benefit.active ? "#d1d5db" : "#8b949e", fontWeight: 500 }}>{benefit.label}</span>
            </label>
            {benefit.active && benefit.notes.length > 0 && (
              <div style={{ background: "#0F1419", border: "1px solid #1F2937", borderRadius: "8px", padding: "10px 12px", marginTop: "6px" }}>
                <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#9ca3af", fontSize: "0.67rem" }}>
                  {benefit.notes.map((note) => <li key={note} style={{ marginBottom: "4px" }}>{note}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}

        <style>{`
          .adjust-slider {
            height: 5px;
            border-radius: 5px;
            background: #3a424d;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
          }
          .adjust-slider::-webkit-slider-thumb {
            appearance: none;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #1FC3EB;
            border: 0;
            cursor: pointer;
          }
          .adjust-slider::-moz-range-thumb {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #1FC3EB;
            border: 0;
            cursor: pointer;
          }
        `}</style>
      </div>
      <div style={{ background: "#1E1E1E", border: "1px solid #273444", borderRadius: "10px", padding: "14px" }}>
        <div
          style={{
            background: "#151515",
            border: "1px solid #2B3138",
            borderRadius: "12px",
            padding: "20px",
            height: "fit-content",
          }}
        >
          {/* TOP COVER SUMMARY */}
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "18px",
            }}
          >
            Cover summary
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {(() => {
              const getCorePremium = (keywords: string[], fallback: string) => {
                const item = benefitBreakdown.find(b => 
                  keywords.some(k => b.benefit_name?.toUpperCase().includes(k.toUpperCase())) ||
                  keywords.some(k => b.benefit_type?.toUpperCase().includes(k.toUpperCase()))
                );
                return item ? `R${item.premium_amount} pm` : fallback;
              };

              const items = [
                { label: "Life", value: getCorePremium(["Life"], "R50 pm") },
                { label: "Occupational Disability", value: getCorePremium(["Disability", "Occupational", "Accident"], "R24 pm") },
                { label: "Funeral", value: getCorePremium(["Funeral"], "R24 pm") },
                ...(augmentation ? [{ label: "Augmentation", value: "R24 pm" }] : []),
                ...(commutingJourney ? [{ label: "Commuting Journey Policy with Crime", value: "R24 pm" }] : []),
                ...(riotAndStrike ? [{ label: "Riot and Strike", value: "R24 pm" }] : []),
                ...(classicPersonalAccident ? [{ label: "Classic Personal Accident", value: "R24 pm" }] : []),
              ];

              return items.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "#A1A1AA",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "#F4F4F5",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ));
            })()}
          </div>

          {/* TOTAL PREMIUM */}
          <div
            style={{
              borderTop: "1px solid #2B3138",
              marginTop: "20px",
              paddingTop: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#A1A1AA",
                }}
              >
                Total monthly premium
              </span>

              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#00C2FF",
                }}
              >
                {fmt(totalMonthlyPremium)} pm
              </span>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: "0.72rem",
                color: "#71717A",
                marginTop: "8px",
              }}
            >
              {employeeCount} employees - average premium per employee{" "}
              <span style={{ color: "#D4D4D8" }}>
                {fmt(costPerMember)} p/m
              </span>
            </p>
          </div>

          {/* SECOND COVER SUMMARY */}
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "18px",
            }}
          >
            Cover summary
          </h3>

          {[
            [
              "Life",
              "0.1% of salary up to a max of R317 per employee p/m*",
            ],
            [
              "Occupational Disability",
              "0.19% of salary up to a max of R69 per employee p/m*",
            ],
            ["Funeral", "R9.00 per member"],
            [
              "Augmentation",
              "0.86% of salary per employee p/m*",
            ],
            [
              "Commuting Journey Policy with Crime",
              "0.35% of salary per employee p/m*",
            ],
            [
              "Riot and Strike",
              "0.09% of salary per employee p/m*",
            ],
            [
              "Classic Personal Accident",
              "1.27% of salary per employee p/m*",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "18px",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#A1A1AA",
                  maxWidth: "45%",
                  lineHeight: 1.5,
                }}
              >
                {label}
              </span>

              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#F4F4F5",
                  textAlign: "right",
                  lineHeight: 1.5,
                }}
              >
                {value}
              </span>
            </div>
          ))}

          <div
            style={{
              borderTop: "1px solid #2B3138",
              marginTop: "16px",
              paddingTop: "14px",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                color: "#71717A",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              * The premium is capped at this value for employees who have
              reached the R2m max cover limit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── component ──────────────────────────────────────────────────────────────────

export default function FullQuoteCapture({ companyName = "—", leadReference = "—", quickQuoteData, quoteReference, onBack, onGenerate }: FullQuoteCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Step 1 fields
  const [employees, setEmployeesCount] = useState(quickQuoteData?.employees || "");
  const [genderSplit, setGenderSplit] = useState(quickQuoteData?.genderSplit || "");
  const [averageAge, setAverageAge] = useState(quickQuoteData?.averageAge || "");
  const [averageIncome, setAverageIncome] = useState(quickQuoteData?.averageIncome || "");
  const [province, setProvince] = useState(quickQuoteData?.province || "");
  const [industry, setIndustry] = useState(quickQuoteData?.industry || "");
  const [scheme, setScheme] = useState("");
  const [benefit, setBenefit] = useState("");
  const [vas, setVas] = useState("");
  const [step0Errors, setStep0Errors] = useState<Record<string, string>>({});

  // Step 0 additional info fields
  const [rmaNumber, setRmaNumber] = useState("");
  const [permanentlyEmployed, setPermanentlyEmployed] = useState<"Yes" | "No" | "">("");
  const [activelyAtWork, setActivelyAtWork] = useState<"Yes" | "No" | "">("");
  const [existingPolicy, setExistingPolicy] = useState<"Yes" | "No" | "">("");
  const [replacedPolicyIncludesDisability, setReplacedPolicyIncludesDisability] = useState<"Yes" | "No" | "">("");
  const [isPolicyOlderThan6Months, setIsPolicyOlderThan6Months] = useState<"Yes" | "No" | "">("");
  const [replacedPolicyStartDate, setReplacedPolicyStartDate] = useState("");
  const [productId, setProductId] = useState("");
  const [generateOptions, setGenerateOptions] = useState(false);
  const [employeeFile, setEmployeeFile] = useState<File | null>(null);

  // Cover / Benefit state
  const [lifeCover, setLifeCover] = useState(0.5);
  const [occupationalDisability, setOccupationalDisability] = useState(0.5);
  const [funeralCover, setFuneralCover] = useState(20000);
  const [additionalBenefits, setAdditionalBenefits] = useState({
    augmentation: true,
    commutingJourney: true,
    riotAndStrike: true,
    comprehensivePersonalAccident: true,
    classicPersonalAccident: true,
  });

  // Yes/No toggle helper
  const YesNoToggle = ({ value, onChange }: { value: string; onChange: (v: "Yes" | "No") => void }) => (
    <div style={{ display: "flex", gap: "8px" }}>
      {(["Yes", "No"] as const).map(opt => {
        const active = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            width: "210px",
            height: "44px",
            borderRadius: "8px",
            border: `0.63px solid ${active ? "#1FC3EB" : "#30363D"}`,
            background: active ? "rgba(31,195,235,0.15)" : "#262626",
            color: active ? "#1FC3EB" : "#9ca3af",
            fontSize: "0.875rem", fontWeight: active ? 500 : 400,
            cursor: "pointer", transition: "all 0.15s",
            padding: "8px 16px",
            boxSizing: "border-box",
          }}>{opt}</button>
        );
      })}
    </div>
  );

  // Step 1 (employee data)
  const [fileName, setFileName] = useState("");
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [manualGender, setManualGender] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setEmployeeFile(file);
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
      setEmployeeList(prev => [...prev, ...data.filter(r => r.length >= 4 && (r[0] || r[1])).map(r => ({
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
    setEmployeeList(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: `${form.firstName} ${form.surname}`.trim(),
      firstName: form.firstName, surname: form.surname,
      gender: manualGender,
      salary: form.salary, income: form.salary, dob: form.dob,
      email: "", cellNumber: "", startDate: "",
      identification: form.identification, idType: form.idType,
      passportExpiry: "", nationality: "", status: "Active",
    }]);
    setForm(EMPTY_FORM);
    setManualGender("");
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!validateRequired(employees) || !validatePositiveNumber(employees))
      e.employees = "At least 1 employee needs to be covered.";
    if (!validateRequired(genderSplit))
      e.genderSplit = "Please select a gender split.";
    if (!validateRequired(averageAge) || !validatePositiveNumber(averageAge))
      e.averageAge = "Average age is required.";
    if (!validateRequired(averageIncome) || !validatePositiveDecimal(averageIncome))
      e.averageIncome = "Income should be a number higher than 0.";
    if (!validateRequired(province))
      e.province = "Please select a province.";
    if (!validateRequired(industry))
      e.industry = "Please select an industry.";
    setStep0Errors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      const data = {
        product_id: productId || undefined,
        rma_member_number: rmaNumber || null,
        is_permanent_employees: permanentlyEmployed === "Yes",
        is_actively_at_work: activelyAtWork === "Yes",
        is_replacing_policy: existingPolicy === "Yes",
        replaced_policy_includes_disability: existingPolicy === "Yes" ? replacedPolicyIncludesDisability === "Yes" : null,
        is_policy_older_than_6_months: existingPolicy === "Yes" ? isPolicyOlderThan6Months === "Yes" : null,
        replaced_policy_start_date: (existingPolicy === "Yes" && replacedPolicyStartDate) ? replacedPolicyStartDate : null,
        province: province || null,
        industry: industry || null,
        generate_options: generateOptions,
        benefits: [
          { benefit_type: "Life Cover", multiple: lifeCover },
          { benefit_type: "Funeral Cover", cover_amount: funeralCover },
          { benefit_type: "Occupational Disability", multiple: occupationalDisability },
          ...(additionalBenefits.augmentation ? [{ benefit_type: "Augmentation" }] : []),
          ...(additionalBenefits.commutingJourney ? [{ benefit_type: "Commuting Journey" }] : []),
          ...(additionalBenefits.riotAndStrike ? [{ benefit_type: "Riot and Strike" }] : []),
          ...(additionalBenefits.comprehensivePersonalAccident ? [{ benefit_type: "Comprehensive Personal Accident" }] : []),
          ...(additionalBenefits.classicPersonalAccident ? [{ benefit_type: "Classic Personal Accident" }] : []),
        ],
        employees: employeeList,
        employeeFile: employeeFile,
      };
      try {
        await onGenerate(data);
        setShowModal(true);
      } catch (err) {
        // Error is handled in the parent component via quoteError
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && showForm) {
      setShowForm(false);
      setEmployeeList([]);
      setForm(EMPTY_FORM);
      setManualGender("");
      return;
    }
    if (currentStep === 1 && showBulkUpload) {
      setShowBulkUpload(false);
      setFileName("");
      setEmployeeList([]);
      return;
    }
    if (currentStep === 0) onBack();
    else setCurrentStep(s => s - 1);
  };

  return (
    <div style={{
      width: "100%",
      boxSizing: "border-box", display: "flex", flexDirection: "column",
    }}>
      {/* Stepper */}
      <StepProgress steps={STEPS} currentStep={currentStep} variant="continuous" />

      {/* Inner card — all steps */}
      {currentStep < STEPS.length && (
        <>

          {/* ── STEP 0: Quote Details ── */}
          {currentStep === 0 && <>
            {/* RMA member number */}
            <div>
              <p style={{ fontSize: "0.875rem", color: "#d1d5db", marginBottom: "12px", lineHeight: 1.6 }}>
                Please enter your RMA member number so we can pre fill your application and offer you additional products.{" "}
                <strong style={{ color: "#ffffff" }}>If you're not an RMA member</strong>, please skip to the next section and complete the form.
              </p>
              <input
                type="text"
                style={inputBase}
                placeholder="Enter RMA number"
                value={rmaNumber}
                onChange={e => setRmaNumber(e.target.value)}
                onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
              />
            </div>

            {/* Province Selection */}
            <div>
              <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                In which province are most of the employees based?
              </label>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                style={selectBase}
                onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
              >
                <option value="">Select Province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Permanently employed */}
            <div>
              <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                Are all the employees you plan to cover permanently employed or on 6+ month contracts?
              </label>
              <YesNoToggle value={permanentlyEmployed} onChange={setPermanentlyEmployed} />
            </div>

            {/* Actively at work (Top-level) */}
            <div>
              <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                Are all the employees you plan to cover currently actively at work? i.e they are attending to their normal work duties and not off on LTD/ill
              </label>
              <YesNoToggle value={activelyAtWork} onChange={setActivelyAtWork} />
            </div>

            {/* Existing policy (Trigger) */}
            <div>
              <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                Is this company offering an existing policy or is very recently cancelled policy?
              </label>
              <YesNoToggle value={existingPolicy} onChange={setExistingPolicy} />
            </div>

            {existingPolicy === "Yes" && (
              <>
                {/* Replaced policy includes disability */}
                <div>
                  <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                    Did the replaced policy include disability cover?
                  </label>
                  <YesNoToggle value={replacedPolicyIncludesDisability} onChange={setReplacedPolicyIncludesDisability} />
                </div>

                {/* Is policy older than 6 months */}
                <div>
                  <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                    Has the policy been active for more than 6 months?
                  </label>
                  <YesNoToggle value={isPolicyOlderThan6Months} onChange={setIsPolicyOlderThan6Months} />
                </div>

                {/* Replaced policy start date */}
                <div>
                  <label style={{ ...labelStyle, color: "#d1d5db", fontSize: "0.875rem", marginBottom: "10px" }}>
                    What was the start date of the replaced policy?
                  </label>
                  <input
                    type="date"
                    value={replacedPolicyStartDate}
                    onChange={e => setReplacedPolicyStartDate(e.target.value)}
                    style={{ ...inputBase, colorScheme: "dark" }}
                    onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
                  />
                </div>
              </>
            )}
          </>}

          {/* ── STEP 1: Employee Information ── */}
          {currentStep === 1 && <>
            {/* Selection cards — hidden while manual form or bulk upload is open */}
            {!showForm && !showBulkUpload && (
              <div style={{ display: "grid", gridTemplateColumns: "271px 271px", gap: "16px" }}>
                {/* Enter manually */}
                <button type="button" onClick={() => setShowForm(true)} style={{
                  textAlign: "left", background: "rgba(48,48,48,0.8)",
                  borderTop: "0.63px solid rgba(31,195,235,0.4)", borderRight: "0.63px solid #30363D",
                  borderBottom: "0.63px solid #30363D", borderLeft: "0.63px solid #30363D",
                  borderRadius: "16px", padding: "20px", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: "14px",
                  width: "271px", height: "225px", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1FC3EB"; el.style.background = "rgba(31,195,235,0.08)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderTopColor = "rgba(31,195,235,0.4)"; el.style.borderRightColor = "#30363D"; el.style.borderBottomColor = "#30363D"; el.style.borderLeftColor = "#30363D"; el.style.background = "rgba(48,48,48,0.8)"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#3a3a3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>Enter manually</h3>
                    <p style={{ fontSize: "0.8125rem", color: "#9ca3af", lineHeight: 1.55 }}>You will need their name, monthly income and date of birth.</p>
                  </div>
                </button>

                {/* Bulk Upload */}
                <button type="button" onClick={() => { setShowBulkUpload(true); setFileName(""); setEmployeeList([]); }} style={{
                  textAlign: "left", background: "rgba(48,48,48,0.8)",
                  borderTop: "0.63px solid rgba(31,195,235,0.4)", borderRight: "0.63px solid #30363D",
                  borderBottom: "0.63px solid #30363D", borderLeft: "0.63px solid #30363D",
                  borderRadius: "16px", padding: "20px", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: "14px",
                  width: "271px", height: "225px", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1FC3EB"; el.style.background = "rgba(31,195,235,0.08)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderTopColor = "rgba(31,195,235,0.4)"; el.style.borderRightColor = "#30363D"; el.style.borderBottomColor = "#30363D"; el.style.borderLeftColor = "#30363D"; el.style.background = "rgba(48,48,48,0.8)"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "#3a3a3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "6px" }}>Bulk Upload</h3>
                    <p style={{ fontSize: "0.8125rem", color: "#9ca3af", lineHeight: 1.55 }}>Use our spreadsheet wizard to upload your employees.</p>
                  </div>
                </button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileChange} />

            {/* Bulk upload view */}
            {showBulkUpload && (
              <div style={{ background: "#1E1E1E", border: "1px solid #30363D", borderRadius: "12px", padding: "20px" }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>Bulk Upload</p>

                {!fileName ? (
                  /* Drag and drop zone — shown before upload */
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `1.5px dashed ${isDragging ? "#1FC3EB" : "#30363D"}`,
                      borderRadius: "10px",
                      padding: "48px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      cursor: "pointer",
                      background: isDragging ? "rgba(31,195,235,0.05)" : "transparent",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1FC3EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p style={{ fontSize: "0.875rem", color: "#9ca3af", margin: 0 }}>
                      Drag and Drop or{" "}
                      <span style={{ color: "#1FC3EB", textDecoration: "underline" }}>Click to upload</span>
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Only .xls, .csv files allowed</p>
                  </div>
                ) : (
                  /* File row — shown after upload */
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#2a2a2a", border: "1px solid #30363D", borderRadius: "8px",
                    padding: "10px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1FC3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>{fileName}</span>
                    </div>
                    <button
                      onClick={() => { setFileName(""); setEmployeeList([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: "2px" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual entry form card */}
            {showForm && (
              <div style={{ background: "#1E1E1E", border: "1px solid #30363D", borderRadius: "12px", padding: "20px" }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>Manually add employees</p>

                {/* Row 1: First Name, Last Name, Gender */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" placeholder="Enter first name" value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" placeholder="Enter last name" value={form.surname}
                      onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select value={manualGender} onChange={e => setManualGender(e.target.value)}
                      style={selectBase} onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Monthly Income, Date of Birth */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Monthly income (before tax)</label>
                    <input type="text" inputMode="decimal" placeholder="R  Enter monthly income" value={form.salary}
                      onChange={e => setForm(f => ({ ...f, salary: e.target.value.replace(/[^\d.]/g, "") }))}
                      style={inputBase} onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of birth (dd/mm/yyyy)</label>
                    <input type="date" value={form.dob}
                      onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                      style={{ ...inputBase, colorScheme: "dark" } as React.CSSProperties}
                      onFocus={onFocus} onBlur={onBlur} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
                  </div>
                </div>

                <button onClick={handleAddEmployee} style={{
                  height: "36px", padding: "0 20px", fontSize: "0.875rem", fontWeight: 500,
                  background: "#1FC3EB", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer",
                }}>Add Employee</button>
              </div>
            )}

            {/* List of Employees card */}
            {(showForm || employeeList.length > 0) && (
              <div style={{ background: "#1E1E1E", border: "1px solid #30363D", borderRadius: "12px", padding: "20px" }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>List of Employees</p>
                <p style={{ fontSize: "0.8125rem", color: "#9ca3af", marginBottom: "16px" }}>
                  You have a total of {employeeList.length} employee{employeeList.length !== 1 ? "s" : ""}.
                </p>

                {employeeList.length > 0 && (
                  <EmployeeListTable
                    employees={employeeList.map(e => ({ id: e.id, name: e.name, gender: e.gender, salary: e.salary, dob: e.dob }))}
                    onRemove={id => setEmployeeList(prev => prev.filter(e => e.id !== id))}
                  />
                )}
              </div>
            )}

            {fileName && employeeList.length > 0 && (
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                <p style={{ fontSize: "0.8125rem", color: "#16a34a", margin: 0 }}>{fileName} — {employeeList.length} employees extracted</p>
              </div>
            )}
          </>}

          {/* ── STEP 2: Adjust ── */}
          {currentStep === 2 && (
            <AdjustCoverStep
              employeeCount={employeeList.length > 0 ? employeeList.length : (parseInt(employees) || 2)}
              averageIncome={parseFloat(averageIncome) || 25000}
              lifeCover={lifeCover}
              setLifeCover={setLifeCover}
              occupationalDisability={occupationalDisability}
              setOccupationalDisability={setOccupationalDisability}
              funeralCover={funeralCover}
              setFuneralCover={setFuneralCover}
              additionalBenefits={additionalBenefits}
              setAdditionalBenefits={setAdditionalBenefits}
              province={province}
              industry={industry}
              averageAge={averageAge}
              setProductId={setProductId}
            />
          )}

        </>
      )}

      {/* Back + Generate Quote */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <BackButton onClick={handleBack} />
        {currentStep < STEPS.length - 1 ? (
          <NextButton label="Next Step" onClick={handleNext} />
        ) : (
          <NextButton label="Generate Quote" onClick={handleNext} />
        )}
      </div>

      {showModal && <DownloadQuoteModal onClose={() => setShowModal(false)} />}
    </div>
  );
}