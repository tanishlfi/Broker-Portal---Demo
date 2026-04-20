"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createLead } from "@/lib/api/leads";

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
  if (!f.companyName.trim()) e.companyName = "Company name is required";
  if (!f.registrationNumber.trim()) e.registrationNumber = "Registration number is required";
  if (!f.industry) e.industry = "Please select an industry";
  if (!f.numberOfEmployees.trim()) e.numberOfEmployees = "Number of employees is required";
  else if (isNaN(Number(f.numberOfEmployees)) || Number(f.numberOfEmployees) <= 0)
    e.numberOfEmployees = "Must be a valid positive number";
  if (!f.companyAddress.trim()) e.companyAddress = "Company address is required";
  if (!f.city.trim()) e.city = "City is required";
  if (!f.province) e.province = "Please select a province";
  if (!f.postalCode.trim()) e.postalCode = "Postal code is required";
  else if (!/^\d{4}$/.test(f.postalCode.trim())) e.postalCode = "Must be a 4-digit postal code";
  return e;
}

function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (!f.contactName.trim()) e.contactName = "Contact name is required";
  if (!f.position.trim()) e.position = "Position is required";
  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
  if (!f.phone.trim()) e.phone = "Phone number is required";
  else if (!/^\+?[\d\s\-()]{7,15}$/.test(f.phone)) e.phone = "Enter a valid phone number";
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

  useEffect(() => {
    setToken(localStorage.getItem("bp_token") ?? "");
    setBrokerId(localStorage.getItem("bp_broker_id") ?? "");
  }, []);

  const base = "w-full bg-[#3d3d3d] border border-[#4d4d4d] rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors";
  const validInput = `${base} focus:border-[#29abe2]`;
  const errorInput = `${base} border-red-500 focus:border-red-400`;
  const lbl = "block text-xs text-gray-400 mb-1";
  const errMsg = (msg?: string) => msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null;

  function handleNext() {
    if (step === 0) { const e = validateEmployer(employer); setEmployerErrors(e); if (Object.keys(e).length) return; }
    if (step === 1) { const e = validateContact(contact); setContactErrors(e); if (Object.keys(e).length) return; }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!token) throw new Error("No auth token found. Please navigate from Client Connect.");
      const [firstName, ...rest] = contact.contactName.trim().split(" ");
      await createLead({
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
      }, token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="px-8 pt-5">
        <button onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      <div className="px-8 pt-6 pb-2">
        <div className="flex max-w-2xl mx-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <span className={`text-xs mb-1 ${i === step ? "text-[#29abe2] font-medium" : i < step ? "text-gray-400" : "text-gray-600"}`}>{label}</span>
              <div className="w-full h-1 rounded-full overflow-hidden bg-[#2a2a2a]">
                <div className={`h-full rounded-full ${i <= step ? "bg-[#29abe2]" : ""}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 py-8">
        <div className="w-full max-w-2xl flex flex-col gap-4">
        <div className="w-full bg-[#2b2b2b] border border-[#3a3a3a] rounded-lg p-8">

          {step === 0 && (
            <>
              <h2 className="text-white font-semibold text-base mb-6">Employer Information</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={lbl}>Company Name *</label>
                  <input className={employerErrors.companyName ? errorInput : validInput} value={employer.companyName}
                    onChange={e => { setEmployer({ ...employer, companyName: e.target.value }); setEmployerErrors({ ...employerErrors, companyName: undefined }); }} />
                  {errMsg(employerErrors.companyName)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Registration Number *</label>
                    <input className={employerErrors.registrationNumber ? errorInput : validInput} value={employer.registrationNumber}
                      onChange={e => { setEmployer({ ...employer, registrationNumber: e.target.value }); setEmployerErrors({ ...employerErrors, registrationNumber: undefined }); }} />
                    {errMsg(employerErrors.registrationNumber)}
                  </div>
                  <div>
                    <label className={lbl}>Industry *</label>
                    <select className={employerErrors.industry ? errorInput : validInput} value={employer.industry}
                      onChange={e => { setEmployer({ ...employer, industry: e.target.value }); setEmployerErrors({ ...employerErrors, industry: undefined }); }}>
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    {errMsg(employerErrors.industry)}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Number of Employees *</label>
                  <input className={employerErrors.numberOfEmployees ? errorInput : validInput} type="number" min="1" value={employer.numberOfEmployees}
                    onChange={e => { setEmployer({ ...employer, numberOfEmployees: e.target.value }); setEmployerErrors({ ...employerErrors, numberOfEmployees: undefined }); }} />
                  {errMsg(employerErrors.numberOfEmployees)}
                </div>
                <div>
                  <label className={lbl}>Company Address *</label>
                  <input className={employerErrors.companyAddress ? errorInput : validInput} value={employer.companyAddress}
                    onChange={e => { setEmployer({ ...employer, companyAddress: e.target.value }); setEmployerErrors({ ...employerErrors, companyAddress: undefined }); }} />
                  {errMsg(employerErrors.companyAddress)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>City *</label>
                    <input className={employerErrors.city ? errorInput : validInput} value={employer.city}
                      onChange={e => { setEmployer({ ...employer, city: e.target.value }); setEmployerErrors({ ...employerErrors, city: undefined }); }} />
                    {errMsg(employerErrors.city)}
                  </div>
                  <div>
                    <label className={lbl}>Province *</label>
                    <select className={employerErrors.province ? errorInput : validInput} value={employer.province}
                      onChange={e => { setEmployer({ ...employer, province: e.target.value }); setEmployerErrors({ ...employerErrors, province: undefined }); }}>
                      <option value="">Select province</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errMsg(employerErrors.province)}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Postal Code *</label>
                  <input className={employerErrors.postalCode ? errorInput : validInput} value={employer.postalCode}
                    onChange={e => { setEmployer({ ...employer, postalCode: e.target.value }); setEmployerErrors({ ...employerErrors, postalCode: undefined }); }} />
                  {errMsg(employerErrors.postalCode)}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-white font-semibold text-base mb-6">Primary Contact Information</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Contact Person Name *</label>
                    <input className={contactErrors.contactName ? errorInput : validInput} value={contact.contactName}
                      onChange={e => { setContact({ ...contact, contactName: e.target.value }); setContactErrors({ ...contactErrors, contactName: undefined }); }} />
                    {errMsg(contactErrors.contactName)}
                  </div>
                  <div>
                    <label className={lbl}>Position *</label>
                    <input className={contactErrors.position ? errorInput : validInput} value={contact.position}
                      onChange={e => { setContact({ ...contact, position: e.target.value }); setContactErrors({ ...contactErrors, position: undefined }); }} />
                    {errMsg(contactErrors.position)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input className={contactErrors.email ? errorInput : validInput} type="email" value={contact.email}
                      onChange={e => { setContact({ ...contact, email: e.target.value }); setContactErrors({ ...contactErrors, email: undefined }); }} />
                    {errMsg(contactErrors.email)}
                  </div>
                  <div>
                    <label className={lbl}>Phone Number *</label>
                    <input className={contactErrors.phone ? errorInput : validInput} type="tel" placeholder="0821234567" value={contact.phone}
                      onChange={e => { setContact({ ...contact, phone: e.target.value }); setContactErrors({ ...contactErrors, phone: undefined }); }} />
                    {errMsg(contactErrors.phone)}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-white font-semibold text-base mb-5">Review Lead Information</h2>
              <p className="text-[#29abe2] text-sm font-medium mb-3">Employer Details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-2">
                <div><p className="text-xs text-gray-500 mb-0.5">Company Name</p><p className="text-sm text-white">{employer.companyName || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Registration Number</p><p className="text-sm text-white">{employer.registrationNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Industry</p><p className="text-sm text-white">{employer.industry || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Number of Employees</p><p className="text-sm text-white">{employer.numberOfEmployees || "—"}</p></div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Address</p>
                  <p className="text-sm text-white">{[employer.companyAddress, employer.city, employer.province, employer.postalCode].filter(Boolean).join(", ") || "—"}</p>
                </div>
              </div>
              <hr className="border-[#2a2a2a] my-5" />
              <p className="text-[#29abe2] text-sm font-medium mb-3">Contact Details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div><p className="text-xs text-gray-500 mb-0.5">Contact Person</p><p className="text-sm text-white">{contact.contactName || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Position</p><p className="text-sm text-white">{contact.position || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Email</p><p className="text-sm text-white">{contact.email || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Phone</p><p className="text-sm text-white">{contact.phone || "—"}</p></div>
              </div>
            </>
          )}


        </div>

        <div className="flex justify-between items-center w-full">
        <div>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-5 py-2 text-sm text-gray-300 bg-[#2a2a2a] hover:bg-[#333] rounded transition-colors cursor-pointer border border-[#3a3a3a]">
              Back
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard")}
            className="px-5 py-2 text-sm text-gray-300 bg-[#2a2a2a] hover:bg-[#333] rounded transition-colors cursor-pointer border border-[#3a3a3a]">
            Cancel
          </button>
          {step < 2 ? (
            <button onClick={handleNext}
              className="px-5 py-2 text-sm text-white bg-[#29abe2] hover:bg-[#1a9fd6] rounded transition-colors cursor-pointer font-medium">
              {step === 0 ? "Next: Contact Details" : "Review"}
            </button>
          ) : (
            <>
              {submitError && <p className="text-red-400 text-xs mr-3 self-center">{submitError}</p>}
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-2 text-sm text-white bg-[#29abe2] hover:bg-[#1a9fd6] rounded transition-colors cursor-pointer font-medium disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Lead"}
              </button>
            </>
          )}
        </div>
        </div>
        </div>
      </div>
    </>
  );
}