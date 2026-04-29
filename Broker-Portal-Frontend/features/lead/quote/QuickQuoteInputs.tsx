import React, { useState } from "react";
import {
  validateSAMobileNumber,
  validateRequired,
  validatePositiveNumber,
  validatePositiveDecimal,
} from "@/utils/validators";

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
  onGenerateQuote?: (data: QuickQuoteData) => void;
}

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

const labelStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 500,
  color: "#ffffff",
  display: "block",
};

const inputBase: React.CSSProperties = {
  height: "40px",
  width: "100%",
  padding: "8px 12px",
  marginTop: "6px",
  background: "#3a3a3a",
  borderRadius: "6px",
  fontSize: "1rem",
  color: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function getInputStyle(hasError: boolean): React.CSSProperties {
  return { ...inputBase, border: `2px solid ${hasError ? "#ef4444" : "#4a4a4a"}` };
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#1FC3EB";
  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(31,195,235,0.2)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) {
  e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#4a4a4a";
  e.currentTarget.style.boxShadow = "none";
}
function onMouseEnter(e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) {
  if (document.activeElement !== e.currentTarget)
    e.currentTarget.style.borderColor = "rgba(31,195,235,0.5)";
}
function onMouseLeave(e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) {
  if (document.activeElement !== e.currentTarget)
    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#4a4a4a";
}

const errMsg = (msg?: string) =>
  msg ? <p style={{ fontSize: "0.875rem", color: "#ef4444", marginTop: "4px" }}>{msg}</p> : null;

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
    if (!validateRequired(cellphone))
      e.cellphone = "Cellphone number is required.";
    else if (!validateSAMobileNumber(cellphone))
      e.cellphone = "Mobile phone number must be 10 digits long and start with 06, 07 or 08.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    const count = parseInt(employees, 10);
    const income = parseFloat(averageIncome);
    const monthly = count * 150 + count * income * 0.05;
    if (onGenerateQuote) {
      onGenerateQuote({
        coverageAmount: monthly * 12 * 40,
        monthlyPremium: monthly,
        numberOfEmployees: count,
        benefitsIncluded: "Basic medical coverage, Life Insurance",
      });
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "896px" }}>
      <div style={{ background: "#2d2d2d", border: "1px solid #4a4a4a", borderRadius: "8px", padding: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "#ffffff", marginBottom: "16px" }}>
          Quick Quote Inputs
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#a0a0a0", marginBottom: "24px" }}>
          Enter key workforce metrics to generate an indicative pricing summary.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>

          {/* Employees */}
          <div>
            <label style={labelStyle}>How many employees do you plan to cover?</label>
            <input
              type="text" inputMode="numeric"
              style={getInputStyle(!!errors.employees)}
              value={employees}
              placeholder="e.g. 150"
              onChange={e => { onFormChange({ ...formData, employees: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, employees: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.employees)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.employees)}
            />
            {errMsg(errors.employees)}
          </div>

          {/* Gender split */}
          <div>
            <label style={labelStyle}>Are they...</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
              {["Mostly male", "Mostly female", "Even split"].map(option => (
                <label key={option} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", color: "#ffffff", cursor: "pointer" }}>
                  <input
                    type="radio" name="genderSplit" value={option}
                    checked={genderSplit === option}
                    onChange={e => { onFormChange({ ...formData, genderSplit: e.target.value }); setErrors({ ...errors, genderSplit: "" }); }}
                    style={{ accentColor: "#1FC3EB", cursor: "pointer" }}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errMsg(errors.genderSplit)}
          </div>

          {/* Average age */}
          <div>
            <label style={labelStyle}>What is their average age?</label>
            <input
              type="text" inputMode="numeric"
              style={getInputStyle(!!errors.averageAge)}
              value={averageAge}
              placeholder="e.g. 35"
              onChange={e => { onFormChange({ ...formData, averageAge: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, averageAge: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.averageAge)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.averageAge)}
            />
            {errMsg(errors.averageAge)}
          </div>

          {/* Average income */}
          <div>
            <label style={labelStyle}>What is their average monthly income (before tax)?</label>
            <input
              type="text" inputMode="decimal"
              style={getInputStyle(!!errors.averageIncome)}
              value={averageIncome}
              placeholder="e.g. 25000"
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

          {/* Province */}
          <div>
            <label style={labelStyle}>In which province are most of the employees based?</label>
            <select
              style={{ ...getInputStyle(!!errors.province), appearance: "auto" } as React.CSSProperties}
              value={province}
              onChange={e => { onFormChange({ ...formData, province: e.target.value }); setErrors({ ...errors, province: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.province)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.province)}
            >
              <option value="">Please select</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errMsg(errors.province)}
          </div>

          {/* Industry */}
          <div>
            <label style={labelStyle}>Which industry is your organisation primarily in?</label>
            <select
              style={{ ...getInputStyle(!!errors.industry), appearance: "auto" } as React.CSSProperties}
              value={industry}
              onChange={e => { onFormChange({ ...formData, industry: e.target.value }); setErrors({ ...errors, industry: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.industry)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.industry)}
            >
              <option value="">Please select</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            {errMsg(errors.industry)}
          </div>

          {/* Cellphone */}
          <div>
            <label style={labelStyle}>What is your cellphone number?</label>
            <input
              type="tel"
              style={getInputStyle(!!errors.cellphone)}
              value={cellphone}
              placeholder="0821234567"
              onChange={e => { onFormChange({ ...formData, cellphone: e.target.value.replace(/\D/g, "").slice(0, 10) }); setErrors({ ...errors, cellphone: "" }); }}
              onFocus={onFocus}
              onBlur={e => onBlur(e, !!errors.cellphone)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={e => onMouseLeave(e, !!errors.cellphone)}
            />
            {errMsg(errors.cellphone)}
          </div>

        </div>

      </div>

      {/* Buttons outside the card */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "16px" }}>
        <button
          onClick={onBack}
          style={{ height: "40px", padding: "0 20px", fontSize: "1rem", fontWeight: 500, background: "transparent", border: "1px solid #4a4a4a", color: "#ffffff", borderRadius: "6px", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#4a4a4a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          Back
        </button>
        <button
          onClick={handleGenerate}
          style={{ height: "40px", padding: "0 20px", fontSize: "1rem", fontWeight: 500, background: "#1FC3EB", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", transition: "opacity 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          Generate Quick Quote
        </button>
      </div>
    </div>
  );
}
