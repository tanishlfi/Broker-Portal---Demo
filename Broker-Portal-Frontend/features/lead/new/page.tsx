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
  validateCity,
  validateAddressLine,
  validateRegistrationNumber,
  validateContactPersonName,
} from "@/utils/validators";
import { BackButton, NextButton, SaveDraftButton, SaveLeadButton, ProceedButton } from "@/components/ui/StepButtons";
import { FormField, formInputStyle, formSelectStyle } from "@/components/ui/FormField";

const STEPS = ["Company Details", "Primary Contact Details", "Preview"];

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

type CompanyForm = {
  companyName: string;
  registrationNumber: string;
  industry: string;
  numberOfEmployees: string;
  companyAddress: string;
  city: string;
  postalCode: string;
  province: string;
};

type ContactForm = {
  contactName: string;
  position: string;
  email: string;
  phone: string;
};

type CompanyErrors = Partial<Record<keyof CompanyForm, string>>;
type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const emptyCompany: CompanyForm = {
  companyName: "", registrationNumber: "", industry: "",
  numberOfEmployees: "",
  companyAddress: "", city: "", postalCode: "", province: "",
};

const emptyContact: ContactForm = {
  contactName: "", position: "", email: "", phone: "",
};

function validateCompany(f: CompanyForm): CompanyErrors {
  const e: CompanyErrors = {};
  if (!validateRequired(f.companyName)) e.companyName = "Company name is required";
  else if (!validateCompanyName(f.companyName)) e.companyName = "Company name must be between 1 and 100 characters";
  if (f.registrationNumber && !validateRegistrationNumber(f.registrationNumber))
    e.registrationNumber = "Registration number must be between 1 and 50 characters";
  if (!f.industry) e.industry = "Please select an industry";
  if (!validateRequired(f.numberOfEmployees)) e.numberOfEmployees = "Number of employees is required";
  else if (!/^\d+$/.test(f.numberOfEmployees) || Number(f.numberOfEmployees) <= 0) {
    e.numberOfEmployees = "Enter a valid employee count";
  }
  if (!validateRequired(f.companyAddress)) e.companyAddress = "Company address is required";
  else if (!validateAddressLine(f.companyAddress)) e.companyAddress = "Address must be between 1 and 100 characters";
  if (!validateRequired(f.city)) e.city = "City is required";
  else if (!validateCity(f.city)) e.city = "City must be between 1 and 50 characters";
  if (!validateRequired(f.postalCode)) e.postalCode = "Postal code is required";
  else if (!validatePostalCode(f.postalCode)) e.postalCode = "Postal code must be exactly 4 digits";
  if (!f.province) e.province = "Please select a province";
  return e;
}

function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (!validateRequired(f.contactName)) e.contactName = "Contact name is required";
  else if (!validateContactPersonName(f.contactName)) e.contactName = "Contact name cannot start with a number";
  if (!validateRequired(f.position)) e.position = "Position is required";
  if (!validateRequired(f.email)) e.email = "Email is required";
  else if (!validateEmail(f.email)) e.email = "Enter a valid email address";
  if (!validateRequired(f.phone)) e.phone = "Phone number is required";
  else if (!validateSAMobileNumber(f.phone)) e.phone = "Must be 10 digits starting with 06, 07 or 08";
  return e;
}

export default function StartNewLeadPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<CompanyForm>(emptyCompany);
  const [contact, setContact] = useState<ContactForm>(emptyContact);
  const [companyErrors, setCompanyErrors] = useState<CompanyErrors>({});
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [brokerId, setBrokerId] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const validToken = getValidToken();
    if (!validToken) { redirectToAuth(); return; }
    setBrokerId(localStorage.getItem("bp_broker_id") ?? "");
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleNext() {
    if (step === 0) {
      const e = validateCompany(company);
      setCompanyErrors(e);
      if (Object.keys(e).length) return;
    }
    if (step === 1) {
      const e = validateContact(contact);
      setContactErrors(e);
      if (Object.keys(e).length) return;
    }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const validToken = getValidToken();
      if (!validToken) {
        setSubmitError("Your session has expired. Redirecting to login...");
        setTimeout(() => redirectToAuth(), 2000);
        return;
      }
      const [firstName, ...rest] = contact.contactName.trim().split(" ");
      const result = await createLead({
        employerName: company.companyName,
        registrationNumber: company.registrationNumber || undefined,
        industryType: company.industry,
        numberOfEmployees: Number(company.numberOfEmployees),
        province: company.province,
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
        router.push(`/quotes/new?leadId=${leadId}&ref=${leadReference}&company=${encodeURIComponent(company.companyName)}`);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      if (msg.includes("not authorized") || msg.includes("EXPIRED")) {
        setSubmitError("Your session has expired. Redirecting to login...");
        setTimeout(() => redirectToAuth(), 2000);
      } else {
        setSubmitError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Page heading */}
      <div style={{ padding: "28px 32px 0" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff", marginBottom: "24px" }}>Add New Lead</h1>
      </div>

      {/* Step progress tabs */}
      <div style={{ padding: "0 32px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
          {STEPS.map((label, i) => (
            <div
              key={`${label}-bar`}
              style={{
                flex: 1,
                height: "6px",
                borderRadius: "9999px",
                background: "#1FC3EB",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {STEPS.map((label, i) => (
            <span
              key={label}
              style={{
                flex: 1,
                fontSize: "13px",
                fontWeight: 400,
                lineHeight: "18px",
                color: "#1FC3EB",
                textAlign: "left",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div style={{ padding: "24px 32px", flex: 1 }}>
        <div style={{ background: "#1E1E1E", border: "1px solid #1D2A36", borderRadius: "10px", padding: "28px 28px 32px" }}>

          {/* Step 0 — Company Details */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <FormField label="Company Name *" error={companyErrors.companyName}>
                <input
                  style={formInputStyle(!!companyErrors.companyName)}
                  value={company.companyName ?? ""}
                  placeholder="Enter Company Name"
                  onChange={e => { setCompany({ ...company, companyName: e.target.value }); setCompanyErrors({ ...companyErrors, companyName: undefined }); }}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Registration Number *" error={companyErrors.registrationNumber}>
                  <input
                    style={formInputStyle(!!companyErrors.registrationNumber)}
                    value={company.registrationNumber ?? ""}
                    placeholder="Enter registration number"
                    onChange={e => {
                      const v = e.target.value.replace(/[^\d/]/g, "");
                      setCompany({ ...company, registrationNumber: v });
                      setCompanyErrors({ ...companyErrors, registrationNumber: undefined });
                    }}
                  />
                </FormField>
                <FormField label="Industry *" error={companyErrors.industry}>
                  <select
                    style={formSelectStyle(!!companyErrors.industry)}
                    value={company.industry ?? ""}
                    onChange={e => { setCompany({ ...company, industry: e.target.value }); setCompanyErrors({ ...companyErrors, industry: undefined }); }}
                  >
                    <option value="">Select</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Number of Employees *" error={companyErrors.numberOfEmployees} style={{ maxWidth: "50%" }}>
                <input
                  style={formInputStyle(!!companyErrors.numberOfEmployees)}
                  value={company.numberOfEmployees ?? ""}
                  placeholder="Enter number of employees"
                  inputMode="numeric"
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "");
                    setCompany({ ...company, numberOfEmployees: v });
                    setCompanyErrors({ ...companyErrors, numberOfEmployees: undefined });
                  }}
                />
              </FormField>

              <FormField label="Company Address *" error={companyErrors.companyAddress}>
                <input
                  style={formInputStyle(!!companyErrors.companyAddress)}
                  value={company.companyAddress ?? ""}
                  placeholder="Enter address of the company"
                  onChange={e => { setCompany({ ...company, companyAddress: e.target.value }); setCompanyErrors({ ...companyErrors, companyAddress: undefined }); }}
                />
              </FormField>

              <FormField label="City *" error={companyErrors.city} style={{ maxWidth: "50%" }}>
                <input
                  style={formInputStyle(!!companyErrors.city)}
                  value={company.city ?? ""}
                  placeholder="Enter name of the city"
                  onChange={e => { setCompany({ ...company, city: e.target.value }); setCompanyErrors({ ...companyErrors, city: undefined }); }}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Postal Code *" error={companyErrors.postalCode}>
                  <input
                    style={formInputStyle(!!companyErrors.postalCode)}
                    value={company.postalCode ?? ""}
                    placeholder="Enter postal code"
                    inputMode="numeric"
                    maxLength={4}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCompany({ ...company, postalCode: v });
                      setCompanyErrors({ ...companyErrors, postalCode: undefined });
                    }}
                  />
                </FormField>
                <FormField label="Province *" error={companyErrors.province}>
                  <select
                    style={formSelectStyle(!!companyErrors.province)}
                    value={company.province ?? ""}
                    onChange={e => { setCompany({ ...company, province: e.target.value }); setCompanyErrors({ ...companyErrors, province: undefined }); }}
                  >
                    <option value="">Select</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FormField>
              </div>
            </div>
          )}

          {/* Step 1 — Primary Contact Details */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <FormField label="Contact Person Name *" error={contactErrors.contactName}>
                <input
                  style={formInputStyle(!!contactErrors.contactName)}
                  value={contact.contactName ?? ""}
                  placeholder="Enter full name"
                  onChange={e => { setContact({ ...contact, contactName: e.target.value }); setContactErrors({ ...contactErrors, contactName: undefined }); }}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Position *" error={contactErrors.position}>
                  <input
                    style={formInputStyle(!!contactErrors.position)}
                    value={contact.position ?? ""}
                    placeholder="Enter position"
                    onChange={e => { setContact({ ...contact, position: e.target.value }); setContactErrors({ ...contactErrors, position: undefined }); }}
                  />
                </FormField>
                <FormField label="Email Address *" error={contactErrors.email}>
                  <input
                    style={formInputStyle(!!contactErrors.email)}
                    type="email"
                    value={contact.email ?? ""}
                    placeholder="Enter email address"
                    onChange={e => { setContact({ ...contact, email: e.target.value }); setContactErrors({ ...contactErrors, email: undefined }); }}
                  />
                </FormField>
              </div>

              <FormField label="Phone Number" error={contactErrors.phone} style={{ maxWidth: "50%" }}>
                <input
                  style={formInputStyle(!!contactErrors.phone)}
                  type="tel"
                  value={contact.phone ?? ""}
                  placeholder="Enter phone number"
                  inputMode="numeric"
                  maxLength={10}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setContact({ ...contact, phone: v });
                    setContactErrors({ ...contactErrors, phone: undefined });
                  }}
                />
              </FormField>
            </div>
          )}

          {/* Step 2 — Preview */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {/* Employer Details */}
              <div style={{ paddingBottom: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>Employer Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Company Name</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{company.companyName || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Registration Number</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{company.registrationNumber || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Industry</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{company.industry || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Number of Employees</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{company.numberOfEmployees || "—"}</p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Address</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{company.companyAddress || "—"}</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #1D2A36", paddingTop: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "16px" }}>Contact Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Contact Person</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{contact.contactName || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Position</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{contact.position || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Email</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{contact.email || "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5E6A77", marginBottom: "4px" }}>Phone</p>
                    <p style={{ fontSize: "14px", color: "#C4CDD8" }}>{contact.phone || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <BackButton onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/dashboard")} />
            <SaveDraftButton onClick={() => router.push("/dashboard")} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {submitError && <p style={{ fontSize: "13px", color: "var(--destructive)" }}>{submitError}</p>}
            {step < 2 ? (
              <NextButton onClick={handleNext} label="Next Step" />
            ) : (
              <>
                <SaveLeadButton onClick={handleSubmit} disabled={submitting} />
                <ProceedButton onClick={handleSubmit} disabled={submitting} label={submitting ? "Submitting..." : "Proceed to Quote Generation"} />
              </>
            )}
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
            <circle cx="9" cy="9" r="9" fill="#22c55e" opacity="0.15" />
            <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>{toast}</span>
        </div>
      )}
    </>
  );
}
