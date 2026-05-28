"use client";

import React, { useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DateInput from "@/components/ui/DateInput";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ApproveQuoteModal from "@/components/quotes/ApproveQuoteModal";
import { saveOnboardingDetails } from "@/lib/api/quotes";
import { useThemeToggle } from "@/app/providers";

interface RadioGroupProps {
  name: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

function CustomRadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-1 mt-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-[15px] text-[var(--text-primary)] font-sans">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-[18px] h-[18px] accent-[#1FC3EB] cursor-pointer"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isDarkMode } = useThemeToggle();

  const quoteId = params.quoteId as string;
  const companyName = searchParams.get("companyName") || "Organisation";
  const quoteReference = searchParams.get("ref") || quoteId;

  // Form State - Your Details
  const [authorised, setAuthorised] = useState<string>("Yes");
  const [isDirector, setIsDirector] = useState<string>("No");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [landline, setLandline] = useState("");
  const [hasSaId, setHasSaId] = useState<string>("No");
  const [idNumber, setIdNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [nationality, setNationality] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [emailForPolicy, setEmailForPolicy] = useState("");
  const [emailForInvoice, setEmailForInvoice] = useState("");

  // Form State - Boss Details
  const [bossFirstName, setBossFirstName] = useState("");
  const [bossSurname, setBossSurname] = useState("");
  const [bossDob, setBossDob] = useState("");
  const [bossHasSaId, setBossHasSaId] = useState<string>("No");
  const [bossIdNumber, setBossIdNumber] = useState("");
  const [bossPassportExpiry, setBossPassportExpiry] = useState("");
  const [bossNationality, setBossNationality] = useState("");
  const [bossHomeAddress, setBossHomeAddress] = useState("");

  // Form State - Organisation Details (Extended)
  const [businessType, setBusinessType] = useState("Public (Listed) Company [Ltd]");
  const [countryOfInc, setCountryOfInc] = useState<string>("South Africa");
  const [registeredName, setRegisteredName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [stockExchangeName, setStockExchangeName] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState<string>("Company profits");
  const [taxNumber, setTaxNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");

  // Form State - Payment Details
  const [acknowledged, setAcknowledged] = useState(false);
  const [bank, setBank] = useState("African Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<string>("Cheque");
  const [debitDay, setDebitDay] = useState<string>("25");

  // Modal / Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const isFormValid =
    firstName.trim() !== "" &&
    surname.trim() !== "" &&
    dob.trim() !== "" &&
    cellphone.trim() !== "" &&
    idNumber.trim() !== "" &&
    (hasSaId === "Yes" || passportExpiry.trim() !== "") &&
    nationality.trim() !== "" &&
    homeAddress.trim() !== "" &&
    emailForPolicy.trim() !== "" &&
    emailForInvoice.trim() !== "" &&
    bossFirstName.trim() !== "" &&
    bossSurname.trim() !== "" &&
    bossDob.trim() !== "" &&
    bossIdNumber.trim() !== "" &&
    (bossHasSaId === "Yes" || bossPassportExpiry.trim() !== "") &&
    bossNationality.trim() !== "" &&
    registeredName.trim() !== "" &&
    tradingName.trim() !== "" &&
    registrationNo.trim() !== "" &&
    registeredAddress.trim() !== "" &&
    physicalAddress.trim() !== "" &&
    taxNumber.trim() !== "" &&
    acknowledged &&
    accountNumber.trim() !== "" &&
    debitDay !== "";

  const handleNext = async () => {
    setIsSubmitting(true);
    const onboardingData = {
      is_authorised: authorised === "Yes",
      is_director: isDirector === "Yes",
      first_name: firstName,
      surname: surname,
      date_of_birth: dob,
      cellphone: cellphone,
      landline: landline,
      has_sa_id: hasSaId === "Yes",
      id_or_passport_number: idNumber,
      passport_expiry: passportExpiry || null,
      nationality: nationality,
      home_address: homeAddress,
      email_for_policy_documents: emailForPolicy,
      email_for_monthly_invoice: emailForInvoice,
      // Boss Details
      boss_first_name: bossFirstName,
      boss_surname: bossSurname,
      boss_date_of_birth: bossDob,
      boss_has_sa_id: bossHasSaId === "Yes",
      boss_id_or_passport: bossIdNumber,
      boss_passport_expiry: bossPassportExpiry || null,
      boss_nationality: bossNationality,
      boss_home_address: bossHomeAddress,
      // Organisation Details
      business_type: businessType,
      country_of_incorporation: countryOfInc,
      registered_name: registeredName,
      trading_name: tradingName,
      registration_number: registrationNo,
      stock_exchange_listing_name: stockExchangeName,
      registered_address: registeredAddress,
      physical_address: physicalAddress,
      source_of_funds: sourceOfFunds,
      company_tax_number: taxNumber,
      company_vat_number: vatNumber,
      // Payment Details
      bank_name: bank,
      bank_account_number: accountNumber,
      bank_account_type: accountType,
      debit_day_of_month: parseInt(debitDay, 10),
      debit_order_authorised: acknowledged,
    };

    try {
      await saveOnboardingDetails(quoteId, onboardingData);
      setShowApproveModal(true);
    } catch (err) {
      console.error("Failed to save onboarding details:", err);
      alert(err instanceof Error ? err.message : "Failed to save onboarding details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = () => {
    setShowApproveModal(false);
    router.push("/quotes?tab=onboarding");
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: "bold",
    color: "var(--text-primary)",
    display: "block",
    marginBottom: "6px",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--primary)",
    marginTop: "0px",
    marginBottom: "8px",
  };

  const getInputStyle = (error?: boolean): React.CSSProperties => ({
    width: "100%",
    height: "44px",
    padding: "0 12px",
    background: "var(--card-secondary)",
    border: error ? "1px solid #ef4444" : "1px solid var(--border)",
    borderRadius: "6px",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    colorScheme: isDarkMode ? "dark" : "light",
  });

  const getSelectStyle = (error?: boolean): React.CSSProperties => ({
    ...getInputStyle(error),
    appearance: "auto",
  });

  return (
    <div className="w-full space-y-3 pb-12">
      {/* Hide native browser calendar icon visually but keep it clickable */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0 !important;
          background: transparent !important;
          color: transparent !important;
        }
      `}</style>

      {/* Back to Quotes navigation */}
      <button
        onClick={() => router.push("/quotes")}
        className="flex items-center gap-2 text-[14px] text-[#1FC3EB] font-medium hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
      >
        <ArrowLeft size={16} /> Back to Quotes
      </button>

      {/* Main Container Card */}
      <div
        className="flex flex-col w-full rounded-[16px] shadow-2xl relative"
        style={{
          background: "var(--card-secondary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Form Content */}
        <div className="px-8 py-6 space-y-5">
          {/* Main Title Area */}
          <div className="text-center space-y-4">
            <h3 className="text-[32px] font-bold text-[var(--text-primary)] leading-tight font-sans">
              Lastly, we need some info for policy servicing and payment
            </h3>
            <p className="text-[20px] text-[var(--text-secondary)] font-sans">
              Please ensure the info is accurate for {companyName} ({quoteReference})
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-10 bg-[var(--table-header-bg)] rounded-sm overflow-hidden flex relative items-center border border-[var(--border)]">
            <div
              className="h-full bg-[#1FC3EB] transition-all duration-500 flex items-center justify-center"
              style={{ width: "80%" }}
            >
              <span className="text-sm font-bold text-[#0A0A0A] px-2 absolute left-1/2 -translate-x-1/2">
                80%
              </span>
            </div>
          </div>

          {/* Question: Authorised */}
          <div className="space-y-2">
            <label style={labelStyle}>
              Are you authorised to act on behalf of the organisation?
            </label>
            <CustomRadioGroup
              name="authorised"
              options={["Yes", "No"]}
              value={authorised}
              onChange={setAuthorised}
            />
          </div>

          {/* Section: Your Details */}
          <div className="space-y-4 pt-3 border-t border-[var(--border)]">
            <h4 style={sectionHeaderStyle}>Your Details</h4>

            {/* Question: Director */}
            <div className="space-y-2">
              <label style={labelStyle}>
                Are you a director or member of the organisation?
              </label>
              <CustomRadioGroup
                name="isDirector"
                options={["Yes", "No"]}
                value={isDirector}
                onChange={setIsDirector}
              />
            </div>

            {/* Inputs: First Name & Surname */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Surname</label>
                <input
                  type="text"
                  placeholder="Surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
            </div>

            {/* Date of Birth & Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label style={labelStyle}>Date of birth (dd/mm/yyyy)</label>
                <div className="mt-auto w-full">
                  <DateInput
                    value={dob}
                    onChange={setDob}
                    inputStyle={getInputStyle()}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label style={labelStyle}>What is your nationality?</label>
                <div className="mt-auto w-full">
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    style={getSelectStyle()}
                  >
                    <option value="">Please select</option>
                    <option value="South African">South African</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cellphone & Landline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Cellphone</label>
                <input
                  type="text"
                  placeholder="Cellphone"
                  value={cellphone}
                  onChange={(e) => setCellphone(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Landline</label>
                <input
                  type="text"
                  placeholder="(optional)"
                  value={landline}
                  onChange={(e) => setLandline(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
            </div>

            {/* Question: SA ID */}
            <div className="space-y-2">
              <label style={labelStyle}>
                Do you have a South African ID Number?
              </label>
              <CustomRadioGroup
                name="hasSaId"
                options={["Yes", "No"]}
                value={hasSaId}
                onChange={setHasSaId}
              />
            </div>

            {/* ID or Passport Number & Passport Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label style={labelStyle}>ID or passport number</label>
                <p className="text-[11px] text-[var(--text-secondary)] mb-2">Used as a password for opening documents containing employee details</p>
                <div className="mt-auto w-full">
                  <input
                    type="text"
                    placeholder="ID or passport number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label style={labelStyle}>Passport expiry (dd/mm/yyyy)</label>
                <div className="mt-auto w-full">
                  <DateInput
                    value={passportExpiry}
                    onChange={setPassportExpiry}
                    inputStyle={getInputStyle()}
                  />
                </div>
              </div>
            </div>

            {/* Home Address */}
            <div>
              <label style={labelStyle}>Home Address</label>
              <input
                type="text"
                placeholder="Type your address ..."
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                style={getInputStyle()}
              />
            </div>

            {/* Emails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label style={labelStyle}>Email address for policy document and logging in</label>
                <p className="text-[11px] text-[var(--text-secondary)] mb-2">Please note sensitive employee info will be sent to this address</p>
                <div className="mt-auto w-full">
                  <input
                    type="email"
                    placeholder="Email address for policy"
                    value={emailForPolicy}
                    onChange={(e) => setEmailForPolicy(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label style={labelStyle}>Email address for monthly invoice</label>
                <div className="mt-auto w-full">
                  <input
                    type="email"
                    placeholder="Email address for invoice"
                    value={emailForInvoice}
                    onChange={(e) => setEmailForInvoice(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Boss / MD / CEO details */}
          <div className="space-y-4 pt-3 border-t border-[var(--border)]">
            <h4 style={sectionHeaderStyle}>Boss / MD / CEO details</h4>

            {/* First Name & Surname */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={bossFirstName}
                  onChange={(e) => setBossFirstName(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Surname</label>
                <input
                  type="text"
                  placeholder="Surname"
                  value={bossSurname}
                  onChange={(e) => setBossSurname(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
            </div>

            {/* DOB & Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label style={labelStyle}>Date of birth (dd/mm/yyyy)</label>
                <div className="mt-auto w-full">
                  <DateInput
                    value={bossDob}
                    onChange={setBossDob}
                    inputStyle={getInputStyle()}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label style={labelStyle}>What is their nationality?</label>
                <div className="mt-auto w-full">
                  <select
                    value={bossNationality}
                    onChange={(e) => setBossNationality(e.target.value)}
                    style={getSelectStyle()}
                  >
                    <option value="">Please select</option>
                    <option value="South African">South African</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Boss SA ID Question */}
            <div className="space-y-2">
              <label style={labelStyle}>
                Does your Boss / MD / CEO have a South African ID Number?
              </label>
              <CustomRadioGroup
                name="bossHasSaId"
                options={["Yes", "No"]}
                value={bossHasSaId}
                onChange={setBossHasSaId}
              />
            </div>

            {/* Boss ID or Passport & Passport Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label style={labelStyle}>ID or passport</label>
                <p className="text-[11px] text-[var(--text-secondary)] mb-2">Used as a password for opening documents containing employee details</p>
                <div className="mt-auto w-full">
                  <input
                    type="text"
                    placeholder="ID or passport"
                    value={bossIdNumber}
                    onChange={(e) => setBossIdNumber(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label style={labelStyle}>Passport expiry (dd/mm/yyyy)</label>
                <div className="mt-auto w-full">
                  <DateInput
                    value={bossPassportExpiry}
                    onChange={setBossPassportExpiry}
                    inputStyle={getInputStyle()}
                  />
                </div>
              </div>
            </div>

            {/* Boss Home Address */}
            <div>
              <label style={labelStyle}>Home Address</label>
              <input
                type="text"
                placeholder="Type your address ..."
                value={bossHomeAddress}
                onChange={(e) => setBossHomeAddress(e.target.value)}
                style={getInputStyle()}
              />
            </div>
          </div>

          {/* Section: Organisation details */}
          <div className="space-y-4 pt-3 border-t border-[var(--border)]">
            <h4 style={sectionHeaderStyle}>Organisation details</h4>

            <p className="text-[14px] text-[#EF4444] font-medium leading-relaxed mb-4">
              If you cannot fill in the information required in this section, please call us on 021 045 1448
            </p>

            {/* Business Type */}
            <div>
              <label style={labelStyle}>What kind of business is this?</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                style={getSelectStyle()}
              >
                <option value="Public (Listed) Company [Ltd]">Public (Listed) Company [Ltd]</option>
                <option value="Private Company (Pty) Ltd">Private Company (Pty) Ltd</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Trust">Trust</option>
              </select>
            </div>

            {/* Country of Incorporation */}
            <div className="space-y-2">
              <label style={labelStyle}>Country of Incorporation/Registration</label>
              <CustomRadioGroup
                name="countryOfInc"
                options={["South Africa", "Other"]}
                value={countryOfInc}
                onChange={setCountryOfInc}
              />
            </div>

            {/* Registered & Trading Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Registered name</label>
                <input
                  type="text"
                  placeholder="Registered name"
                  value={registeredName}
                  onChange={(e) => setRegisteredName(e.target.value)}
                  style={getInputStyle()}
                />
              </div>

              <div>
                <label style={labelStyle}>Trading name</label>
                <input
                  type="text"
                  placeholder="Trading name"
                  value={tradingName}
                  onChange={(e) => setTradingName(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
            </div>

            {/* Registration No & Stock Exchange */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Registration no</label>
                <input
                  type="text"
                  placeholder="Registration no"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Name of Stock Exchange Listing</label>
                <input
                  type="text"
                  placeholder="Stock exchange listing"
                  value={stockExchangeName}
                  onChange={(e) => setStockExchangeName(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <label style={labelStyle}>Registered Address</label>
                <div className="mt-auto w-full">
                  <input
                    type="text"
                    placeholder="Type registered address ..."
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label style={labelStyle}>Physical Address</label>
                <p className="text-[11px] text-[var(--text-secondary)] mb-2">Provide Head Office address if there are multiple addresses</p>
                <div className="mt-auto w-full">
                  <input
                    type="text"
                    placeholder="Type physical address ..."
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>
            </div>

            {/* Source of Funds */}
            <div className="space-y-2">
              <label style={labelStyle}>Source of Funds</label>
              <CustomRadioGroup
                name="sourceOfFunds"
                options={["Company profits", "Investment returns", "Donations", "Government"]}
                value={sourceOfFunds}
                onChange={setSourceOfFunds}
              />
            </div>

            {/* Tax & VAT Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Company Tax Number</label>
                <input
                  type="text"
                  placeholder="Tax number"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
              <div>
                <label style={labelStyle}>Company VAT Number (if applicable)</label>
                <input
                  type="text"
                  placeholder="(optional)"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  style={getInputStyle()}
                />
              </div>
            </div>
          </div>

          {/* Section: Payment details */}
          <div className="space-y-4 pt-3 border-t border-[var(--border)]">
            <h4 style={sectionHeaderStyle}>Payment details</h4>

            {/* Legal Mandate Text */}
            <div className="space-y-4 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              <p>
                I authorise By checking the box below, you authorise to deduct the monthly premium of{" "}
                <strong className="text-[var(--text-primary)]">Rand Mutual Assurance</strong> from R1,436's bank account (details below),
                on condition the amount deducted never exceeds the amount committed to under this policy. This mandate
                will commence on the debit order date selected below and will continue monthly thereafter
                until it is terminated by giving not less than one month's notice. The reference number for the
                deduction will be combined with my policy number.
              </p>
              <p>
                In the event the payment day falls on a Sunday, or recognised South African public holiday,
                the payment day will automatically be the preceding ordinary business day. If there are
                insufficient funds in the nominated account to meet the obligation, you are entitled to track
                my account and re-present the instruction for payment as soon as sufficient funds are
                available in my account.
              </p>
              <p>
                I agree that cancelling this mandate will not cancel the agreement, and that I will not be
                entitled to any refund of amounts which you have withdrawn while this Authority was in force,
                if such amounts were legally owing to you. I also acknowledge that this Authority may only be
                ceded or assigned to a third party if the Agreement is also ceded or assigned to that third party.
              </p>
            </div>

            {/* Acknowledge Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-5 h-5 accent-[#1FC3EB] rounded bg-[var(--input)] border-[var(--border)] cursor-pointer"
              />
              <span className="text-[15px] font-bold text-[var(--text-primary)] group-hover:text-[#1FC3EB] transition-colors">
                Acknowledge
              </span>
            </label>

            {/* Bank & Account Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Bank</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  style={getSelectStyle()}
                >
                  <option value="African Bank">African Bank</option>
                  <option value="ABSA">ABSA</option>
                  <option value="Capitec">Capitec</option>
                  <option value="FNB">FNB</option>
                  <option value="Nedbank">Nedbank</option>
                  <option value="Standard Bank">Standard Bank</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Bank account number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Bank account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    style={getInputStyle()}
                  />
                </div>
              </div>
            </div>

            {/* Bank Account Type */}
            <div className="space-y-2">
              <label style={labelStyle}>Bank account type</label>
              <CustomRadioGroup
                name="accountType"
                options={["Cheque", "Current", "Savings", "Transmission"]}
                value={accountType}
                onChange={setAccountType}
              />
            </div>

            {/* Debit Day Dropdown */}
            <div className="pb-8">
              <label style={labelStyle}>Which day of the month should we debit the bank account?</label>
              <select
                value={debitDay}
                onChange={(e) => setDebitDay(e.target.value)}
                style={getSelectStyle()}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day)}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--card-secondary)] border-t border-[var(--border)] space-y-4 flex-shrink-0">
          <button
            onClick={() => alert("Downloading quote...")}
            className="text-[14px] text-[#1FC3EB] font-medium hover:underline transition-colors bg-transparent border-none cursor-pointer"
          >
            Download quote
          </button>

          <button
            onClick={handleNext}
            disabled={!isFormValid || isSubmitting}
            className={`w-[240px] h-[50px] rounded-lg font-bold text-[18px] transition-all flex items-center justify-center shadow-lg border-none cursor-pointer ${
              !isFormValid || isSubmitting ? "opacity-30 cursor-not-allowed bg-[var(--border)] text-[var(--text-secondary)]" : "bg-[#F59E0B] text-[#0A0A0A] hover:opacity-90"
            }`}
          >
            {isSubmitting ? "Saving..." : "Next"}
          </button>

          <button
            onClick={() => router.push("/quotes")}
            className="text-[14px] text-[#1FC3EB] font-medium hover:underline transition-colors bg-transparent border-none cursor-pointer"
          >
            or go back
          </button>
        </div>
      </div>

      {/* OTP / Approval Modal Overlay on top of this page */}
      {showApproveModal && (
        <ApproveQuoteModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          quoteId={quoteId}
          quoteReference={quoteReference}
          companyName={companyName}
          onSendOTP={handleSendOTP}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-8 text-center text-secondary">Loading Checkout Page...</div>}>
        <CheckoutPageContent />
      </Suspense>
    </DashboardLayout>
  );
}
