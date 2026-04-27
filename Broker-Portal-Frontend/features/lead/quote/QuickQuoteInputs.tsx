import React, { useState } from "react";
import { 
  validateSAMobileNumber, 
  validateRequired, 
  validatePositiveNumber,
  validatePositiveDecimal
} from "@/utils/validators";

interface QuickQuoteInputsProps {
  onBack: () => void;
}

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

export default function QuickQuoteInputs({ onBack }: QuickQuoteInputsProps) {
  const [employees, setEmployees] = useState("");
  const [genderSplit, setGenderSplit] = useState("");
  const [averageAge, setAverageAge] = useState("");
  const [averageIncome, setAverageIncome] = useState("");
  const [province, setProvince] = useState("");
  const [industry, setIndustry] = useState("");
  const [cellphone, setCellphone] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(employees)) {
      newErrors.employees = "At least 1 employee needs to be covered.";
    } else if (!validatePositiveNumber(employees)) {
      newErrors.employees = "At least 1 employee needs to be covered.";
    }

    if (!validateRequired(genderSplit)) {
      newErrors.genderSplit = "Please select a gender split.";
    }

    if (!validateRequired(averageAge)) {
      newErrors.averageAge = "Average age is required.";
    } else if (!validatePositiveNumber(averageAge)) {
      newErrors.averageAge = "Average age must be a valid positive number.";
    }

    if (!validateRequired(averageIncome)) {
      newErrors.averageIncome = "Average monthly income is required.";
    } else if (!validatePositiveDecimal(averageIncome)) {
      newErrors.averageIncome = "Income should be a number higher than 0.";
    }

    if (!validateRequired(province)) {
      newErrors.province = "Please select a province.";
    }

    if (!validateRequired(industry)) {
      newErrors.industry = "Please select an industry.";
    }

    if (!validateRequired(cellphone)) {
      newErrors.cellphone = "Cellphone number is required.";
    } else if (!validateSAMobileNumber(cellphone)) {
      newErrors.cellphone = "Mobile phone number must be 10 digits long and start with 06, 07 or 08.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateQuote = () => {
    if (validateForm()) {
      // Proceed with generating quote
      console.log("Validation passed. Form data:", {
        employees, genderSplit, averageAge, averageIncome, province, industry, cellphone
      });
    }
  };

  const baseClasses = "w-full bg-[#303030] rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors border";
  const getClass = (hasError?: boolean) => 
    `${baseClasses} ${hasError ? "border-red-500 focus:border-red-400" : "border-[#444] focus:border-[#29abe2] hover:border-[#555]"}`;

  const errMsg = (msg?: string) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;
  
  return (
    <div className="w-full max-w-[720px] flex flex-col gap-4 pb-12">
      {/* Main Card */}
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-10 py-8 w-full shadow-md">
        <h2 className="text-white text-base font-semibold mb-2">
          Quick Quote Inputs
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          Enter key workforce metrics to generate an indicative pricing summary.
        </p>

        <div className="space-y-6">
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">How many employees do you plan to cover?</label>
            <input 
              type="text"
              inputMode="numeric"
              className={getClass(!!errors.employees)}
              value={employees}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setEmployees(value);
                setErrors({ ...errors, employees: "" });
              }}
            />
            {errMsg(errors.employees)}
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">Are they...</label>
            <div className="flex flex-col gap-2">
              {["Mostly male", "Mostly female", "Even split"].map(option => (
                <label key={option} className="flex items-center gap-2 text-white text-sm cursor-pointer hover:text-[#29abe2] transition-colors w-fit">
                  <input 
                    type="radio" 
                    name="genderSplit" 
                    value={option} 
                    checked={genderSplit === option} 
                    onChange={(e) => {
                      setGenderSplit(e.target.value);
                      setErrors({ ...errors, genderSplit: "" });
                    }}
                    className="accent-[#29abe2] cursor-pointer"
                  />
                  {option}
                </label>
              ))}
            </div>
            {errMsg(errors.genderSplit)}
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">What is their average age?</label>
            <input 
              type="text"
              inputMode="numeric"
              className={getClass(!!errors.averageAge)}
              value={averageAge}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setAverageAge(value);
                setErrors({ ...errors, averageAge: "" });
              }}
            />
            {errMsg(errors.averageAge)}
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">What is their average monthly income (before tax)?</label>
            <input 
              type="text"
              inputMode="decimal"
              className={getClass(!!errors.averageIncome)}
              value={averageIncome}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d.]/g, "");
                // Prevent multiple dots
                if ((value.match(/\./g) || []).length > 1) {
                  value = value.replace(/\.$/, "");
                }
                setAverageIncome(value);
                setErrors({ ...errors, averageIncome: "" });
              }}
            />
            {errMsg(errors.averageIncome)}
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">In which province are most of the employees based?</label>
            <select 
              className={getClass(!!errors.province)}
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setErrors({ ...errors, province: "" });
              }}
            >
              <option value="">Please select</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errMsg(errors.province)}
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">Which industry is your organisation primarily in?</label>
            <select 
              className={getClass(!!errors.industry)}
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setErrors({ ...errors, industry: "" });
              }}
            >
              <option value="">Please select</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            {errMsg(errors.industry)}
          </div>
          <div>
            <label className="text-white text-xs font-semibold mb-2 block">What is your cellphone number?</label>
            <input 
              type="tel"
              className={getClass(!!errors.cellphone)}
              value={cellphone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setCellphone(value);
                setErrors({ ...errors, cellphone: "" });
              }}
              placeholder="0821234567"
            />
            {errMsg(errors.cellphone)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack}
          className="bg-[#303030] hover:bg-[#404040] border border-[#444] text-white text-xs font-semibold py-2.5 px-6 rounded-md transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handleGenerateQuote}
          className="bg-[#4b8fa6] hover:bg-[#3e798e] border border-[#52a2bc] text-white text-xs font-semibold py-2.5 px-6 rounded-md transition-colors opacity-90 hover:opacity-100"
        >
          Generate Quick Quote
        </button>
      </div>
    </div>
  );
}
