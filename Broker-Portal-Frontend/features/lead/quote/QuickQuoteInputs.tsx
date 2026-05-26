import React, { useState } from "react";
import {
  validateRequired,
  validatePositiveNumber,
  validatePositiveDecimal,
} from "@/utils/validators";
import { BackButton, NextButton } from "@/components/ui/StepButtons";
import StepProgress from "@/components/ui/StepProgress";
import OptionToggleGroup from "@/components/ui/OptionToggleGroup";

const QUICK_STEPS = ["Quote Details", "Adjust Cover Amounts"];

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

const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 400,
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: "6px",
};

const getInputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  height: "40px",
  background: "#1E1E1E",
  border: `1px solid ${hasError ? "#ef4444" : "#30363D"}`,
  borderRadius: "6px",
  padding: "0 12px",
  color: "#ffffff",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

const getSelectStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  height: "40px",
  background: "#1E1E1E",
  border: `1px solid ${hasError ? "#ef4444" : "#30363D"}`,
  borderRadius: "6px",
  padding: "0 12px",
  color: "#ffffff",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
  appearance: "auto",
});

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = "#1FC3EB";
  e.currentTarget.style.boxShadow = "0 0 0 1px #1FC3EB";
};

const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) => {
  e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#30363D";
  e.currentTarget.style.boxShadow = "none";
};

const onMouseEnter = (e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) => {
  if (document.activeElement !== e.currentTarget) {
    e.currentTarget.style.borderColor = "rgba(31,195,235,0.5)";
  }
};

const onMouseLeave = (e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) => {
  if (document.activeElement !== e.currentTarget) {
    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#30363D";
  }
};

const errMsg = (msg?: string) =>
  msg ? <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px" }}>{msg}</p> : null;

export default function QuickQuoteInputs({ formData, onFormChange, onBack, onGenerateQuote }: QuickQuoteInputsProps) {
  const { employees, genderSplit, averageAge, averageIncome, province, industry } = formData;
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
    <>
      <StepProgress steps={QUICK_STEPS} currentStep={0} variant="continuous" />

      <div style={{
        background: "var(--card-secondary)",
        border: "1px solid var(--border)",
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
          <OptionToggleGroup
            options={["Mostly male", "Mostly female", "Even split"]}
            value={genderSplit}
            onChange={val => { onFormChange({ ...formData, genderSplit: val }); setErrors({ ...errors, genderSplit: "" }); }}
            error={errors.genderSplit}
          />
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

