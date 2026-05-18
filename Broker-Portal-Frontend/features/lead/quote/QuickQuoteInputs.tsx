import React, { useState } from "react";
import {
  validateRequired,
  validatePositiveNumber,
  validatePositiveDecimal,
} from "@/utils/validators";
import { BackButton, NextButton } from "@/components/ui/StepButtons";
import StepProgress from "@/components/ui/StepProgress";
import CustomInput from "@/components/ui/CustomInput";
import CustomSelect from "@/components/ui/CustomSelect";
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
  color: "#9ca3af",
  display: "block",
  marginBottom: "6px",
};

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
          <CustomInput
            type="text" inputMode="numeric"
            value={employees}
            placeholder="85"
            onChange={e => { onFormChange({ ...formData, employees: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, employees: "" }); }}
            error={errors.employees}
          />
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
            <CustomInput
              type="text" inputMode="numeric"
              value={averageAge}
              placeholder="Enter average age"
              onChange={e => { onFormChange({ ...formData, averageAge: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, averageAge: "" }); }}
              error={errors.averageAge}
            />
          </div>
          <div>
            <label style={labelStyle}>What is their average monthly income (before tax)?</label>
            <CustomInput
              type="text" inputMode="decimal"
              value={averageIncome}
              placeholder="R Enter average salary"
              onChange={e => {
                let v = e.target.value.replace(/[^\d.]/g, "");
                if ((v.match(/\./g) || []).length > 1) v = v.replace(/\.$/, "");
                onFormChange({ ...formData, averageIncome: v });
                setErrors({ ...errors, averageIncome: "" });
              }}
              error={errors.averageIncome}
            />
          </div>
        </div>

        {/* Province + Industry — side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>In which province are most of the employees based?</label>
            <CustomSelect
              value={province}
              onChange={e => { onFormChange({ ...formData, province: e.target.value }); setErrors({ ...errors, province: "" }); }}
              error={errors.province}
            >
              <option value="">Select province</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </CustomSelect>
          </div>
          <div>
            <label style={labelStyle}>Which industry is your organisation primarily in?</label>
            <CustomSelect
              value={industry}
              onChange={e => { onFormChange({ ...formData, industry: e.target.value }); setErrors({ ...errors, industry: "" }); }}
              error={errors.industry}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </CustomSelect>
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
