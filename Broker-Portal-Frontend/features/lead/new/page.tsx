"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/lib/api/leads";
import { getValidToken, redirectToAuth } from "@/lib/auth";
import {
  validateSAMobileNumber,
  validateEmail,
  validatePostalCode,
  validateCompanyName,
  validateRequired,
  validatePositiveNumber,
  validateCity,
  validateAddressLine,
  validateRegistrationNumber,
  validateContactPersonName,
} from "@/utils/validators";

const STEPS = ["1. Employer Details", "2. Contact Details", "3. Review & Submit"];

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

type EmployerForm = {
  companyName: string; registrationNumber: string; industry: string;
  numberOfEmployees: string; companyAddress: string; city: string;
  province: string; postalCode: string;
};
type ContactForm = { contactName: string; position: string; email: string; phone: string; };
type EmployerErrors = Partial<Record<keyof EmployerForm, string>>;
type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const emptyEmployer: EmployerForm = {
  companyName: "", registrationNumber: "", industry: "",
  numberOfEmployees: "", companyAddress: "", city: "", province: "", postalCode: "",
};
const emptyContact: ContactForm = { contactName: "", position: "", email: "", phone: "" };

function validateEmployer(f: EmployerForm): EmployerErrors {
  const e: EmployerErrors = {};
  
  // Company Name validation
  if (!validateRequired(f.companyName)) {
    e.companyName = "Company name is required";
  } else if (!validateCompanyName(f.companyName)) {
    e.companyName = "Company name must be between 1 and 100 characters";
  }
  
  // Registration Number validation (optional field, matches Client Connect API)
  if (!validateRegistrationNumber(f.registrationNumber)) {
    e.registrationNumber = "Registration number must be between 1 and 50 characters if provided";
  }
  
  // Industry validation
  if (!f.industry) {
    e.industry = "Please select an industry";
  }
  
  // Number of Employees validation
  if (!validateRequired(f.numberOfEmployees)) {
    e.numberOfEmployees = "Number of employees is required";
  } else if (!validatePositiveNumber(f.numberOfEmployees)) {
    e.numberOfEmployees = "Must be a valid positive number";
  }
  
  // Company Address validation
  if (!validateRequired(f.companyAddress)) {
    e.companyAddress = "Company address is required";
  } else if (!validateAddressLine(f.companyAddress)) {
    e.companyAddress = "Address must be between 1 and 100 characters";
  }
  
  // City validation
  if (!validateRequired(f.city)) {
    e.city = "City is required";
  } else if (!validateCity(f.city)) {
    e.city = "City must be between 1 and 50 characters";
  }
  
  // Province validation
  if (!f.province) {
    e.province = "Please select a province";
  }
  
  // Postal Code validation
  if (!validateRequired(f.postalCode)) {
    e.postalCode = "Postal code is required";
  } else if (!validatePostalCode(f.postalCode)) {
    e.postalCode = "Postal code must be exactly 4 digits";
  }
  
  return e;
}

function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  
  // Contact Name validation
  if (!validateRequired(f.contactName)) {
    e.contactName = "Contact name is required";
  } else if (!validateContactPersonName(f.contactName)) {
    e.contactName = "Contact name cannot start with a number";
  }
  
  // Position validation
  if (!validateRequired(f.position)) {
    e.position = "Position is required";
  }
  
  // Email validation
  if (!validateRequired(f.email)) {
    e.email = "Email is required";
  } else if (!validateEmail(f.email)) {
    e.email = "Enter a valid email address";
  }
  
  // Phone Number validation
  if (!validateRequired(f.phone)) {
    e.phone = "Phone number is required";
  } else if (!validateSAMobileNumber(f.phone)) {
    e.phone = "Mobile phone number must be 10 digits long and start with 06, 07 or 08";
  }
  
  return e;
}

export default function StartNewLeadPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [employer, setEmployer] = useState<EmployerForm>(emptyEmployer);
  const [contact, setContact] = useState<ContactForm>(emptyContact);
  const [employerErrors, setEmployerErrors] = useState<EmployerErrors>({});
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [brokerId, setBrokerId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Skip auth check in local development
    if (process.env.NODE_ENV === "development") {
      setBrokerId(localStorage.getItem("bp_broker_id") ?? "");
      return;
    }

    const validToken = getValidToken();
    if (!validToken) {
      window.location.href = process.env.NEXT_PUBLIC_CLIENT_CONNECT_URL || "http://localhost:4200";
      return;
    }
    setToken(validToken);
    setBrokerId(localStorage.getItem("bp_broker_id") ?? "");
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) return null;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const inp = (hasError: boolean) => `bp-input${hasError ? " error" : ""}`;
  const lbl = "block font-medium text-white text-sm";
  const errMsg = (msg?: string) => msg ? (
    <p style={{ fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5, color: "var(--destructive)", marginTop: "0.25rem" }}>{msg}</p>
  ) : null;

  function handleNext() {
    if (step === 0) { const e = validateEmployer(employer); setEmployerErrors(e); if (Object.keys(e).length) return; }
    if (step === 1) { const e = validateContact(contact); setContactErrors(e); if (Object.keys(e).length) return; }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Validate token before submission (skip in dev)
      const validToken = process.env.NODE_ENV === "development"
        ? (localStorage.getItem("bp_token") ?? "dev-token")
        : getValidToken();

      if (!validToken && process.env.NODE_ENV !== "development") {
        setSubmitError("Your session has expired. Redirecting to login...");
        setTimeout(() => redirectToAuth(), 2000);
        return;
      }

      const [firstName, ...rest] = contact.contactName.trim().split(" ");
      const result = await createLead({
        employerName: employer.companyName,
        registrationNumber: employer.registrationNumber || undefined,
        industryType: employer.industry,
        numberOfEmployees: Number(employer.numberOfEmployees),
        province: employer.province,
        contactFirstName: firstName,
        contactLastName: rest.join(" ") || firstName,
        contactEmail: contact.email,
        contactMobile: contact.phone,
        preferredCommunicationMethod: "Email",
        representativeId: brokerId || "00000000-0000-0000-0000-000000000000",
        brokerId: brokerId || "00000000-0000-0000-0000-000000000000",
      }, validToken);
      const { leadId, leadReference } = result.data;
      showToast("Lead created successfully");
      setTimeout(() => {
        router.push(`/quotes/new?leadId=${leadId}&ref=${leadReference}&company=${encodeURIComponent(employer.companyName)}`);
      }, 1200);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      // Check if it's an auth error
      if (errorMessage.includes("not authorized") || errorMessage.includes("EXPIRED")) {
        setSubmitError("Your session has expired. Redirecting to login...");
        setTimeout(() => redirectToAuth(), 2000);
      } else {
        setSubmitError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2" style={{ background: "var(--background)" }}>
        <div className="flex max-w-4xl mx-auto mb-2 justify-between">
          {STEPS.map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: "0.875rem",
                fontWeight: 400,
                lineHeight: 1,
                color: i === step ? "var(--primary)" : "var(--muted-foreground)",
                marginBottom: "0.25rem",
                display: "block",
                textAlign: i === STEPS.length - 1 ? "right" : "left",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        {/* Single track with animated fill */}
        <div
          className="max-w-4xl mx-auto"
          style={{
            height: "8px",
            backgroundColor: "#3a3a3a",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#1FC3EB",
              borderRadius: "9999px",
              width: `${((step + 1) / STEPS.length) * 100}%`,
              transition: "width 300ms ease",
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-6 py-6" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-4xl flex flex-col gap-4">
        <div
          className="w-full rounded-lg p-6"
          style={{
            background: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "8px",
          }}
        >

          {step === 0 && (
            <>
              <h2 className="font-medium mb-6" style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>Employer Information</h2>
              <div className="space-y-6">
                <div>
                  <label className={lbl}>Company Name *</label>
                  <input
                    className={inp(!!employerErrors.companyName)}
                    value={employer.companyName}
                    onChange={e => { setEmployer({ ...employer, companyName: e.target.value }); setEmployerErrors({ ...employerErrors, companyName: undefined }); }} 
                    placeholder="e.g., Acme Corporation" />
                  {errMsg(employerErrors.companyName)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Registration Number</label>
                    <input
                      className={inp(!!employerErrors.registrationNumber)}
                      value={employer.registrationNumber}
                      onChange={e => { 
                        const value = e.target.value.replace(/[^\d/]/g, "");
                        setEmployer({ ...employer, registrationNumber: value }); 
                        setEmployerErrors({ ...employerErrors, registrationNumber: undefined }); 
                      }} 
                      placeholder="e.g., 2016/4924343/07"
                      inputMode="numeric" />
                    {errMsg(employerErrors.registrationNumber)}
                  </div>
                  <div>
                    <label className={lbl}>Industry *</label>
                    <select
                      className={inp(!!employerErrors.industry)}
                      value={employer.industry}
                      onChange={e => { setEmployer({ ...employer, industry: e.target.value }); setEmployerErrors({ ...employerErrors, industry: undefined }); }}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    {errMsg(employerErrors.industry)}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Number of Employees *</label>
                  <input
                    className={inp(!!employerErrors.numberOfEmployees)}
                    type="number" min="1" value={employer.numberOfEmployees}
                    onChange={e => { 
                      const value = e.target.value.replace(/\D/g, "");
                      setEmployer({ ...employer, numberOfEmployees: value }); 
                      setEmployerErrors({ ...employerErrors, numberOfEmployees: undefined }); 
                    }} 
                    inputMode="numeric"
                    placeholder="e.g., 150" />
                  {errMsg(employerErrors.numberOfEmployees)}
                </div>
                <div>
                  <label className={lbl}>Company Address *</label>
                  <input
                    className={inp(!!employerErrors.companyAddress)}
                    value={employer.companyAddress}
                    onChange={e => { setEmployer({ ...employer, companyAddress: e.target.value }); setEmployerErrors({ ...employerErrors, companyAddress: undefined }); }} 
                    placeholder="e.g., 123 Main Street" />
                  {errMsg(employerErrors.companyAddress)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>City *</label>
                    <input
                      className={inp(!!employerErrors.city)}
                      value={employer.city}
                      onChange={e => { setEmployer({ ...employer, city: e.target.value }); setEmployerErrors({ ...employerErrors, city: undefined }); }} 
                      placeholder="e.g., Johannesburg" />
                    {errMsg(employerErrors.city)}
                  </div>
                  <div>
                    <label className={lbl}>Province *</label>
                    <select
                      className={inp(!!employerErrors.province)}
                      value={employer.province}
                      onChange={e => { setEmployer({ ...employer, province: e.target.value }); setEmployerErrors({ ...employerErrors, province: undefined }); }}>
                      <option value="">Select province</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errMsg(employerErrors.province)}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Postal Code *</label>
                  <input
                    className={inp(!!employerErrors.postalCode)}
                    value={employer.postalCode}
                    onChange={e => { 
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setEmployer({ ...employer, postalCode: value }); 
                      setEmployerErrors({ ...employerErrors, postalCode: undefined }); 
                    }} 
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="0000" />
                  {errMsg(employerErrors.postalCode)}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-medium mb-6" style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>Primary Contact Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Contact Person Name *</label>
                    <input
                      className={inp(!!contactErrors.contactName)}
                      value={contact.contactName}
                      onChange={e => { setContact({ ...contact, contactName: e.target.value }); setContactErrors({ ...contactErrors, contactName: undefined }); }} 
                      placeholder="e.g., John Smith" />
                    {errMsg(contactErrors.contactName)}
                  </div>
                  <div>
                    <label className={lbl}>Position *</label>
                    <input
                      className={inp(!!contactErrors.position)}
                      value={contact.position}
                      onChange={e => { setContact({ ...contact, position: e.target.value }); setContactErrors({ ...contactErrors, position: undefined }); }} 
                      placeholder="e.g., HR Manager" />
                    {errMsg(contactErrors.position)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input
                      className={inp(!!contactErrors.email)}
                      type="email" value={contact.email}
                      onChange={e => { setContact({ ...contact, email: e.target.value }); setContactErrors({ ...contactErrors, email: undefined }); }} 
                      placeholder="e.g., john@company.com" />
                    {errMsg(contactErrors.email)}
                  </div>
                  <div>
                    <label className={lbl}>Phone Number *</label>
                    <input
                      className={inp(!!contactErrors.phone)}
                      type="tel" placeholder="0821234567" 
                      value={contact.phone}
                      onChange={e => { 
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setContact({ ...contact, phone: value }); 
                        setContactErrors({ ...contactErrors, phone: undefined }); 
                      }} 
                      inputMode="numeric"
                      maxLength={10} />
                    {errMsg(contactErrors.phone)}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "24px" }}>Review Lead Information</h2>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--primary)", marginBottom: "12px" }}>Employer Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Company Name</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{employer.companyName || "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Registration Number</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{employer.registrationNumber || "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Industry</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{employer.industry || "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Number of Employees</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{employer.numberOfEmployees || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Address</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{[employer.companyAddress, employer.city, employer.province, employer.postalCode].filter(Boolean).join(", ") || "—"}</p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", marginTop: "24px" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--primary)", marginBottom: "12px" }}>Contact Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Contact Person</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{contact.contactName || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Position</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{contact.position || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Email</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{contact.email || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--muted-foreground)" }}>Phone</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--foreground)" }}>{contact.phone || "—"}</p>
                  </div>
                </div>
              </div>
            </>
          )}


        </div>

        <div className="flex justify-between items-center w-full">
        <div>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ fontSize: "1rem", fontWeight: 500, height: "40px", padding: "0 20px", background: "transparent", border: "1px solid var(--border)", color: "#ffffff", borderRadius: "6px", cursor: "pointer" }}>
              Back
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard")}
            style={{ fontSize: "1rem", fontWeight: 500, height: "40px", padding: "0 20px", background: "transparent", border: "1px solid var(--border)", color: "#ffffff", borderRadius: "6px", cursor: "pointer" }}>
            Cancel
          </button>
          {step < 2 ? (
            <button onClick={handleNext}
              style={{ fontSize: "1rem", fontWeight: 500, height: "40px", padding: "0 20px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              {step === 0 ? "Next: Contact Details" : "Review"}
            </button>
          ) : (
            <>
              {submitError && <p className="text-red-400 text-xs mr-3 self-center">{submitError}</p>}
              <button onClick={handleSubmit} disabled={submitting}
                style={{ fontSize: "1rem", fontWeight: 500, height: "40px", padding: "0 20px", background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "6px", cursor: "pointer", opacity: submitting ? 0.5 : 1 }}>
                {submitting ? "Submitting..." : "Submit Lead"}
              </button>
            </>
          )}
        </div>
        </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: "#1e1e1e", border: "1px solid #3a3a3a", borderRadius: "8px",
          padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)", minWidth: "220px",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="#22c55e" opacity="0.15"/>
            <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>{toast}</span>
        </div>
      )}
    </>
  );
}