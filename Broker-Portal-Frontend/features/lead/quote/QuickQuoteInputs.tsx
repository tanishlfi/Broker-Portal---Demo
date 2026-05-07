import React, { useState } from "react";
import {
  validateSAMobileNumber,
  validateRequired,
  validatePositiveNumber,
  validatePositiveDecimal,
} from "@/utils/validators";
import { BackButton, NextButton } from "@/components/ui/StepButtons";
import StepProgress from "@/components/ui/StepProgress";

const QUICK_STEPS = ["Quote Details", "Adjust Cover Amounts"];

interface QuickQuoteData {
  coverageAmount: number;
  monthlyPremium: number;
  numberOfEmployees: number;
  benefitsIncluded: string;
}

interface FormData {
  employees: string;
  genderSplit: string;
  averageAge: string;
  averageIncome: string;
  province: string;
  industry: string;
  cellphone: string;
}

interface QuickQuoteInputsProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onBack: () => void;
  onGenerateQuote?: () => void;
}

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

// ── shared styles ──────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 400,
  color: "#9ca3af",
  display: "block",
  marginBottom: "6px",
};

const inputBase: React.CSSProperties = {
  height: "40px",
  width: "100%",
  padding: "0 12px",
  background: "#2a2a2a",
  border: "1px solid #30363D",
  borderRadius: "6px",
  fontSize: "0.875rem",
  color: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const selectBase: React.CSSProperties = {
  ...inputBase,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "32px",
  cursor: "pointer",
};

function getInputStyle(hasError: boolean): React.CSSProperties {
  return { ...inputBase, borderColor: hasError ? "#ef4444" : "#30363D" };
}

function getSelectStyle(hasError: boolean): React.CSSProperties {
  return { ...selectBase, borderColor: hasError ? "#ef4444" : "#30363D" };
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#1FC3EB";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31,195,235,0.15)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) {
  e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#30363D";
  e.currentTarget.style.boxShadow = "none";
}
function onMouseEnter(e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) {
  if (document.activeElement !== e.currentTarget)
    e.currentTarget.style.borderColor = "rgba(31,195,235,0.5)";
}
function onMouseLeave(e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) {
  if (document.activeElement !== e.currentTarget)
    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#30363D";
}

const errMsg = (msg?: string) =>
  msg ? <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px" }}>{msg}</p> : null;

// ── component ──────────────────────────────────────────────────────────────────

export default function QuickQuoteInputs({ formData, onFormChange, onBack, onGenerateQuote }: QuickQuoteInputsProps) {
  const { employees, genderSplit, averageAge, averageIncome, province, industry, cellphone } = formData;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    if (onGenerateQuote) {
      onGenerateQuote();
    }
  };

  return (
    /* Inner form card: #1E1E1E, border 1px #30363D, radius 12px */
    <>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>
        Quick Cost Estimate
      </h2>

      <StepProgress steps={QUICK_STEPS} currentStep={0} />

      <div style={{
        background: "#181818CC",
        border: "1px solid #30363D",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        flex: 1,
      }}>

        {/* Employees — full width */}
        <div>
          <label style={labelStyle}>How many employees do you plan to cover?</label>
          <input
            type="text" inputMode="numeric"
            style={getInputStyle(!!errors.employees)}
            value={employees}
            placeholder="85"
            onChange={e => { onFormChange({ ...formData, employees: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, employees: "" }); }}
            onFocus={onFocus}
            onBlur={e => onBlur(e, !!errors.employees)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={e => onMouseLeave(e, !!errors.employees)}
          />
          {errMsg(errors.employees)}
        </div>

        {/* Gender split — horizontal pill toggles */}
        <div>
          <label style={labelStyle}>Are they...</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["Mostly male", "Mostly female", "Even split"].map(option => {
              const active = genderSplit === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => { onFormChange({ ...formData, genderSplit: option }); setErrors({ ...errors, genderSplit: "" }); }}
                  style={{
                    height: "36px",
                    padding: "0 20px",
                    borderRadius: "6px",
                    border: `1px solid ${active ? "#1FC3EB" : "#30363D"}`,
                    background: active ? "rgba(31,195,235,0.15)" : "#2a2a2a",
                    color: active ? "#1FC3EB" : "#9ca3af",
                    fontSize: "0.875rem",
                    fontWeight: active ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {errMsg(errors.genderSplit)}
        </div>

        {/* Age + Income — side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>What is their average age?</label>
            <input
              type="text" inputMode="numeric"
              style={getInputStyle(!!errors.averageAge)}
              value={averageAge}
              placeholder="Enter average age"
              onChange={e => { onFormChange({ ...formData, averageAge: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, averageAge: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.averageAge)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.averageAge)}
            />
            {errMsg(errors.averageAge)}
          </div>
          <div>
            <label style={labelStyle}>What is their average monthly income (before tax)?</label>
            <input
              type="text" inputMode="decimal"
              style={getInputStyle(!!errors.averageIncome)}
              value={averageIncome}
              placeholder="R Enter average salary"
              onChange={e => {
                let v = e.target.value.replace(/[^\d.]/g, "");
                if ((v.match(/\./g) || []).length > 1) v = v.replace(/\.$/, "");
                onFormChange({ ...formData, averageIncome: v });
                setErrors({ ...errors, averageIncome: "" });
              }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.averageIncome)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.averageIncome)}
            />
            {errMsg(errors.averageIncome)}
          </div>
        </div>

        {/* Province + Industry — side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>In which province are most of the employees based?</label>
            <select
              style={getSelectStyle(!!errors.province)}
              value={province}
              onChange={e => { onFormChange({ ...formData, province: e.target.value }); setErrors({ ...errors, province: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.province)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.province)}
            >
              <option value="">Select province</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errMsg(errors.province)}
          </div>
          <div>
            <label style={labelStyle}>Which industry is your organisation primarily in?</label>
            <select
              style={getSelectStyle(!!errors.industry)}
              value={industry}
              onChange={e => { onFormChange({ ...formData, industry: e.target.value }); setErrors({ ...errors, industry: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.industry)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.industry)}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            {errMsg(errors.industry)}
          </div>
        </div>

      </div>

      {/* Back + Generate Quote — outside the card, bottom of outer frame */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <BackButton onClick={onBack} />
        <NextButton label="Next Step" onClick={handleGenerate} />
      </div>
    </>
  );
}
