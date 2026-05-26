"use client";

import { useRef, useState } from "react";
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
import OptionToggleGroup from "@/components/ui/OptionToggleGroup";
import AdjustFullCoverStep from "./components/AdjustFullCoverStep";
import CheckoutInfoModal from "@/components/quotes/CheckoutInfoModal";
import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import { useRouter } from "next/navigation";
import { INDUSTRY_TYPE_OPTIONS, PROVINCE_OPTIONS } from "@/lib/enums";
import CustomInput from "@/components/ui/CustomInput";
import CustomSelect from "@/components/ui/CustomSelect";


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
  leadId: string;
  onBack: () => void;
  onGenerate: (data: any) => Promise<any>;
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.8125rem", fontWeight: 400, color: "var(--text-secondary)", display: "block", marginBottom: "6px",
};


const STEPS = ["Quote Details", "Employee Information", "Cover Adjustments"];

const EMPTY_FORM = { firstName: "", surname: "", dob: "", salary: "", idType: "SA ID", identification: "" };

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

// ── component ──────────────────────────────────────────────────────────────────

export default function FullQuoteCapture({ companyName = "—", leadReference = "—", quickQuoteData, quoteReference, leadId, onBack, onGenerate }: FullQuoteCaptureProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [coverMode, setCoverMode] = useState<"multiple" | "equal">("multiple");
  const [createdQuote, setCreatedQuote] = useState<{ id: string; quoteReference: string } | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isGeneratingForApproval, setIsGeneratingForApproval] = useState(false);

  // Step 1 fields
  const [employees, setEmployeesCount] = useState(quickQuoteData?.employees || "");
  const [genderSplit, setGenderSplit] = useState(quickQuoteData?.genderSplit || "");
  const [averageAge, setAverageAge] = useState(quickQuoteData?.averageAge || "");
  const [averageIncome, setAverageIncome] = useState(quickQuoteData?.averageIncome || "");
  const [province, setProvince] = useState(quickQuoteData?.province || "");
  const [industry, setIndustry] = useState(quickQuoteData?.industry || "");
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
    if (currentStep === 1) {
      if (employeeList.length === 0) return;
      setIsImporting(true);
      try {
        const { importEmployees } = await import('@/lib/api/employees');
        const formattedEmployees = employeeList.map(e => ({
          firstName: e.firstName || e.name.split(' ')[0] || "Unknown",
          surname: e.surname || e.name.split(' ').slice(1).join(' ') || "Unknown",
          gender: (() => {
            const g = (e.gender || "").trim().toLowerCase();
            if (g.startsWith("m")) return "Male";
            if (g.startsWith("f")) return "Female";
            if (g === "prefer not to say") return "Prefer Not to Say";
            return "Other";
          })(),
          income: parseFloat(e.income || e.salary || "1000") || 1000,
          dateOfBirth: e.dob ? (e.dob.includes('/') ? e.dob.split('/').reverse().join('-') : e.dob) : "2000-01-01",
          email: e.email || "user@example.com",
          cellNumber: e.cellNumber || "0821234567",
          employmentStartDate: e.startDate ? (e.startDate.includes('/') ? e.startDate.split('/').reverse().join('-') : e.startDate) : "2026-05-18",
          idNumber: e.identification || "1234567890123",
          nationality: e.nationality || "South African",
        }));

        await importEmployees({ lead_id: leadId, employees: formattedEmployees });
        setIsImporting(false);
        setCurrentStep(s => s + 1);
      } catch (err: any) {
        setIsImporting(false);
        console.error("Employee import failed:", err);
        const errMsg = err.message || JSON.stringify(err.errors) || "Unknown error";
        alert("Failed to import employees: " + errMsg);
        return;
      }
    } else if (currentStep < STEPS.length - 1) {
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
          { benefit_type: "Life Cover", [coverMode === "multiple" ? "multiple" : "cover_amount"]: lifeCover },
          { benefit_type: "Funeral Cover", cover_amount: funeralCover },
          { benefit_type: "Occupational Disability", [coverMode === "multiple" ? "multiple" : "cover_amount"]: occupationalDisability },
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
        // Error is handled in the parent component
      }
    }
  };

  const handleApproveQuoteDirectly = async () => {
    setIsGeneratingForApproval(true);
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
        { benefit_type: "Life Cover", [coverMode === "multiple" ? "multiple" : "cover_amount"]: lifeCover },
        { benefit_type: "Funeral Cover", cover_amount: funeralCover },
        { benefit_type: "Occupational Disability", [coverMode === "multiple" ? "multiple" : "cover_amount"]: occupationalDisability },
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
      const quote = await onGenerate(data);
      if (quote) {
        setCreatedQuote({ id: quote.quoteId, quoteReference: quote.quoteReference });
        setShowCheckoutModal(true);
      }
    } catch (err) {
      console.error("Failed to generate quote for approval:", err);
    } finally {
      setIsGeneratingForApproval(false);
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

  const yesNoButtonStyle = { width: "210px", height: "44px", borderRadius: "8px" };

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
          {currentStep === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Province Selection */}
              <div>
                <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                  In which province are most of the employees based?
                </label>
                <CustomSelect
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  style={getSelectStyle(false)}
                  onFocus={onFocus}
                  onBlur={e => onBlur(e, false)}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={e => onMouseLeave(e, false)}
                >
                  <option value="">Select Province</option>
                  {PROVINCE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </CustomSelect>
              </div>

              {/* Permanently employed */}
              <div>
                <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                  Are all the employees you plan to cover permanently employed or on 6+ month contracts?
                </label>
                <OptionToggleGroup
                  options={["Yes", "No"]}
                  value={permanentlyEmployed}
                  onChange={(val: string) => setPermanentlyEmployed(val as "Yes" | "No")}
                  buttonStyle={yesNoButtonStyle}
                />
              </div>

              {/* Actively at work (Top-level) */}
              <div>
                <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                  Are all the employees you plan to cover currently actively at work? i.e they are attending to their normal work duties and not off on LTD/ill
                </label>
                <OptionToggleGroup
                  options={["Yes", "No"]}
                  value={activelyAtWork}
                  onChange={(val: string) => setActivelyAtWork(val as "Yes" | "No")}
                  buttonStyle={yesNoButtonStyle}
                />
              </div>

              {/* Existing policy (Trigger) */}
              <div>
                <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                  Is this company offering an existing policy or is very recently cancelled policy?
                </label>
                <OptionToggleGroup
                  options={["Yes", "No"]}
                  value={existingPolicy}
                  onChange={(val: string) => setExistingPolicy(val as "Yes" | "No")}
                  buttonStyle={yesNoButtonStyle}
                />
              </div>

              {existingPolicy === "Yes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
                  {/* Replaced policy includes disability */}
                  <div>
                    <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                      Did the replaced policy include disability cover?
                    </label>
                    <OptionToggleGroup
                      options={["Yes", "No"]}
                      value={replacedPolicyIncludesDisability}
                      onChange={(val: string) => setReplacedPolicyIncludesDisability(val as "Yes" | "No")}
                      buttonStyle={yesNoButtonStyle}
                    />
                  </div>

                  {/* Is policy older than 6 months */}
                  <div>
                    <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                      Has the policy been active for more than 6 months?
                    </label>
                    <OptionToggleGroup
                      options={["Yes", "No"]}
                      value={isPolicyOlderThan6Months}
                      onChange={(val: string) => setIsPolicyOlderThan6Months(val as "Yes" | "No")}
                      buttonStyle={yesNoButtonStyle}
                    />
                  </div>
                </div>
              )}

              {/* Replaced policy start date (Always visible) */}
              <div>
                <label style={{ ...labelStyle, color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "10px" }}>
                  What was the start date of the replaced policy?
                </label>
                <CustomInput
                  type="date"
                  value={replacedPolicyStartDate}
                  onChange={e => setReplacedPolicyStartDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 1: Employee Information ── */}
          {currentStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Selection cards — hidden while manual form or bulk upload is open */}
              {!showForm && !showBulkUpload && (
                <div style={{ display: "grid", gridTemplateColumns: "271px 271px", gap: "16px" }}>
                  {/* Enter manually */}
                  <button type="button" onClick={() => setShowForm(true)} style={{
                    textAlign: "left", background: "var(--card-secondary)",
                    borderTop: "0.63px solid rgba(31,195,235,0.4)", borderRight: "0.63px solid var(--border)",
                    borderBottom: "0.63px solid var(--border)", borderLeft: "0.63px solid var(--border)",
                    borderRadius: "16px", padding: "20px", cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: "14px",
                    width: "271px", height: "225px", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1FC3EB"; el.style.background = "var(--border)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderTopColor = "rgba(31,195,235,0.4)"; el.style.borderRightColor = "var(--border)"; el.style.borderBottomColor = "var(--border)"; el.style.borderLeftColor = "var(--border)"; el.style.background = "var(--card-secondary)"; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Enter manually</h3>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>You will need their name, monthly income and date of birth.</p>
                    </div>
                  </button>

                  {/* Bulk Upload */}
                  <button type="button" onClick={() => { setShowBulkUpload(true); setFileName(""); setEmployeeList([]); }} style={{
                    textAlign: "left", background: "var(--card-secondary)",
                    borderTop: "0.63px solid rgba(31,195,235,0.4)", borderRight: "0.63px solid var(--border)",
                    borderBottom: "0.63px solid var(--border)", borderLeft: "0.63px solid var(--border)",
                    borderRadius: "16px", padding: "20px", cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: "14px",
                    width: "271px", height: "225px", boxSizing: "border-box", transition: "border-color 0.2s, background 0.2s",
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1FC3EB"; el.style.background = "var(--border)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderTopColor = "rgba(31,195,235,0.4)"; el.style.borderRightColor = "var(--border)"; el.style.borderBottomColor = "var(--border)"; el.style.borderLeftColor = "var(--border)"; el.style.background = "var(--card-secondary)"; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Bulk Upload</h3>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>Use our spreadsheet wizard to upload your employees.</p>
                    </div>
                  </button>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileChange} />

              {/* Bulk upload view */}
              {showBulkUpload && (
                <div style={{ background: "var(--card-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>Bulk Upload</p>

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
                        border: `1.5px dashed ${isDragging ? "#1FC3EB" : "var(--border)"}`,
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
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                        Drag and Drop or{" "}
                        <span style={{ color: "#1FC3EB", textDecoration: "underline" }}>Click to upload</span>
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Only .xls, .csv files allowed</p>
                    </div>
                  ) : (
                    /* File row — shown after upload */
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "var(--table-header-bg)", border: "1px solid var(--border)", borderRadius: "8px",
                      padding: "10px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1FC3EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{fileName}</span>
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
                <div style={{ background: "var(--card-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Manually add employees</p>

                  {/* Row 1: First Name, Last Name, Gender */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input type="text" placeholder="Enter first name" value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                        style={getInputStyle(false)}
                        onFocus={onFocus}
                        onBlur={e => onBlur(e, false)}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={e => onMouseLeave(e, false)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input type="text" placeholder="Enter last name" value={form.surname}
                        onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
                        style={getInputStyle(false)}
                        onFocus={onFocus}
                        onBlur={e => onBlur(e, false)}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={e => onMouseLeave(e, false)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Gender</label>
                      <select value={manualGender} onChange={e => setManualGender(e.target.value)}
                        style={getSelectStyle(false)}
                        onFocus={onFocus}
                        onBlur={e => onBlur(e, false)}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={e => onMouseLeave(e, false)}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Monthly Income, Date of Birth */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>Monthly income (before tax)</label>
                      <input type="text" inputMode="decimal" placeholder="R Enter monthly income" value={form.salary}
                        onChange={e => setForm(f => ({ ...f, salary: e.target.value.replace(/[^\d.]/g, "") }))}
                        style={getInputStyle(false)}
                        onFocus={onFocus}
                        onBlur={e => onBlur(e, false)}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={e => onMouseLeave(e, false)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of birth (dd/mm/yyyy)</label>
                      <input type="date" value={form.dob}
                        onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                        style={getInputStyle(false)}
                        onFocus={onFocus}
                        onBlur={e => onBlur(e, false)}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={e => onMouseLeave(e, false)}
                      />
                    </div>
                  </div>

                  <button onClick={handleAddEmployee} style={{
                    height: "36px", width: "fit-content", padding: "0 20px", fontSize: "0.875rem", fontWeight: 500,
                    background: "#1FC3EB", color: "#0A0A0A", border: "none", borderRadius: "6px", cursor: "pointer",
                  }}>Add Employee</button>
                </div>
              )}

              {/* List of Employees card */}
              {(showForm || employeeList.length > 0) && (
                <div style={{ background: "var(--card-secondary)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>List of Employees</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
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
            </div>
          )}

          {/* ── STEP 2: Adjust ── */}
          {currentStep === 2 && (
            <AdjustFullCoverStep
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
              coverMode={coverMode}
              setCoverMode={setCoverMode}
            />
          )}
        </>
      )}

      {/* Back + Generate Quote */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <BackButton onClick={handleBack} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {currentStep === 2 && (
            <NextButton
              label={isGeneratingForApproval ? "Generating..." : "Approve Quote"}
              onClick={handleApproveQuoteDirectly}
              disabled={isGeneratingForApproval}
            />
          )}
          {currentStep < STEPS.length - 1 ? (
            <NextButton label={isImporting ? "Uploading..." : "Next Step"} onClick={handleNext} disabled={isImporting || (currentStep === 1 && employeeList.length === 0)} />
          ) : (
            <NextButton label="Generate Quote" onClick={handleNext} />
          )}
        </div>
      </div>

      {showModal && <DownloadQuoteModal onClose={() => setShowModal(false)} />}

      {showCheckoutModal && createdQuote && (
        <CheckoutInfoModal
          isOpen={showCheckoutModal}
          onClose={() => {
            setShowCheckoutModal(false);
            setCreatedQuote(null);
          }}
          quoteId={createdQuote.quoteReference}
          companyName={companyName}
          onNext={async (onboardingData) => {
            // TODO: Implement onboarding details save when API endpoint is available
            setShowCheckoutModal(false);
            setShowApproveModal(true);
          }}
        />
      )}

      {showApproveModal && createdQuote && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setCreatedQuote(null);
          }}
          quoteId={createdQuote.id}
          quoteReference={createdQuote.quoteReference}
          companyName={companyName}
          onSendOTP={() => {
            setShowApproveModal(false);
            setCreatedQuote(null);
            router.push("/quotes?tab=onboarding");
          }}
        />
      )}
    </div>
  );
}