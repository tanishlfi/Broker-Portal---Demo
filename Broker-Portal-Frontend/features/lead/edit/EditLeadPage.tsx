"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLead, updateLead } from "@/lib/api/leads";
import {
  validateSAMobileNumber,
  validateEmail,
  validateRequired,
  validatePositiveNumber,
} from "@/utils/validators";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

const INDUSTRIES = [
  "Agriculture", "Construction", "Education", "Finance", "Healthcare",
  "Hospitality", "Manufacturing", "Mining", "Retail", "Technology", "Transport", "Other",
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

interface EditLeadPageProps {
  leadId: string;
}

export default function EditLeadPage({ leadId }: EditLeadPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [industry, setIndustry] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [province, setProvince] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const lead = await getLead(leadId);
        if (lead) {
          setCompanyName(lead.employerName || "");
          setRegistrationNumber(lead.registrationNumber || "");
          setIndustry(lead.industry || "");
          setNumberOfEmployees(String(lead.numberOfEmployees || ""));
          setProvince(lead.province || "");
          
          const name = [lead.contactFirstName, lead.contactLastName].filter(Boolean).join(" ");
          setContactName(name);
          setContactEmail(lead.contactEmail || "");
          setContactPhone(lead.contactPhone || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load lead details");
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId]);

  const handleSave = async () => {
    const errs: Record<string, string> = {};

    if (!validateRequired(companyName)) errs.companyName = "Company name is required";
    if (!validateRequired(industry)) errs.industry = "Industry is required";
    if (!validateRequired(numberOfEmployees) || !validatePositiveNumber(numberOfEmployees)) {
      errs.numberOfEmployees = "Must be a valid positive number";
    }
    if (!validateRequired(province)) errs.province = "Province is required";
    if (!validateRequired(contactName)) errs.contactName = "Contact name is required";
    if (!validateRequired(contactEmail) || !validateEmail(contactEmail)) {
      errs.contactEmail = "Enter a valid email address";
    }
    if (!validateRequired(contactPhone) || !validateSAMobileNumber(contactPhone)) {
      errs.contactPhone = "Enter a valid 10-digit SA mobile number";
    }

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const [firstName, ...rest] = contactName.trim().split(" ");
      const payload = {
        employer: {
          employer_name: companyName,
          registration_number: registrationNumber || undefined,
          industry_type: industry,
          number_of_employees: Number(numberOfEmployees),
          province: province,
        },
        contact: {
          contact_first_name: firstName,
          contact_last_name: rest.join(" ") || firstName,
          contact_email: contactEmail,
          contact_mobile: contactPhone,
          preferred_communication_method: "Email",
        }
      };

      await updateLead(leadId, payload);
      router.push("/lead/view");
    } catch (err: any) {
      setError(err.message || "Failed to save lead updates");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ py: 6, textAlign: "center", color: "var(--text-secondary)" }}>Loading lead details...</Box>;
  }

  const inp = (field: string) => `bp-input${validationErrors[field] ? " error" : ""}`;
  const lbl = "block font-medium text-sm text-[var(--foreground)] opacity-90 mb-1.5";
  const errMsg = (field: string) => validationErrors[field] ? (
    <p style={{ fontSize: "0.875rem", color: "var(--destructive)", marginTop: "0.25rem" }}>{validationErrors[field]}</p>
  ) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
          Edit Lead
        </h1>
      </div>

      <div style={{
        background: "var(--card)",
        border: "2px solid var(--border)",
        borderRadius: "8px",
        padding: "24px"
      }}>
        {error && (
          <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid var(--destructive)", borderRadius: "6px", color: "var(--destructive)", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <h2 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "20px" }}>Employer Information</h2>
        <div className="space-y-6">
          <div>
            <label className={lbl}>Company Name *</label>
            <input className={inp("companyName")} value={companyName} onChange={e => { setCompanyName(e.target.value); setValidationErrors({ ...validationErrors, companyName: "" }); }} />
            {errMsg("companyName")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Registration Number</label>
              <input className={inp("registrationNumber")} value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value.replace(/[^\d/]/g, ""))} placeholder="e.g. 2016/4924343/07" />
            </div>
            <div>
              <label className={lbl}>Industry *</label>
              <select className={inp("industry")} value={industry} onChange={e => { setIndustry(e.target.value); setValidationErrors({ ...validationErrors, industry: "" }); }}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errMsg("industry")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Number of Employees *</label>
              <input type="number" className={inp("numberOfEmployees")} value={numberOfEmployees} onChange={e => { setNumberOfEmployees(e.target.value); setValidationErrors({ ...validationErrors, numberOfEmployees: "" }); }} />
              {errMsg("numberOfEmployees")}
            </div>
            <div>
              <label className={lbl}>Province *</label>
              <select className={inp("province")} value={province} onChange={e => { setProvince(e.target.value); setValidationErrors({ ...validationErrors, province: "" }); }}>
                <option value="">Select province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errMsg("province")}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", margin: "32px 0 24px 0" }} />

        <h2 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "20px" }}>Primary Contact Information</h2>
        <div className="space-y-6">
          <div>
            <label className={lbl}>Contact Person Name *</label>
            <input className={inp("contactName")} value={contactName} onChange={e => { setContactName(e.target.value); setValidationErrors({ ...validationErrors, contactName: "" }); }} />
            {errMsg("contactName")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Email Address *</label>
              <input type="email" className={inp("contactEmail")} value={contactEmail} onChange={e => { setContactEmail(e.target.value); setValidationErrors({ ...validationErrors, contactEmail: "" }); }} />
              {errMsg("contactEmail")}
            </div>
            <div>
              <label className={lbl}>Phone Number *</label>
              <input type="tel" className={inp("contactPhone")} value={contactPhone} maxLength={10} onChange={e => { setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setValidationErrors({ ...validationErrors, contactPhone: "" }); }} />
              {errMsg("contactPhone")}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
        <Button variant="outlined" onClick={() => router.push("/lead/view")} sx={{ borderColor: "var(--border)", color: "var(--text-primary)", textTransform: "none", borderRadius: "8px" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: "#1FC3EB", color: "#0A0A0A", fontWeight: 600, textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#0DB5D8" } }}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
