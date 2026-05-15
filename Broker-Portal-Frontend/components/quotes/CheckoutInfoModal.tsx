"use client";

import React, { useState } from "react";
import { X, Lock, Info, Calendar } from "lucide-react";

interface CheckoutInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: any) => void;
  companyName: string;
  quoteId: string;
}

export default function CheckoutInfoModal({
  isOpen,
  onClose,
  onNext,
  companyName,
  quoteId,
}: CheckoutInfoModalProps) {
  // Form State - Your Details
  const [authorised, setAuthorised] = useState<string>("Yes");
  const [isDirector, setIsDirector] = useState<string>("No");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [cellphone, setCellphone] = useState("0938473234");
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

  if (!isOpen) return null;

  const isFormValid =
    firstName.trim() !== "" &&
    surname.trim() !== "" &&
    dob.trim() !== "" &&
    cellphone.trim() !== "" &&
    idNumber.trim() !== "" &&
    emailForPolicy.trim() !== "" &&
    emailForInvoice.trim() !== "" &&
    bossFirstName.trim() !== "" &&
    bossSurname.trim() !== "" &&
    bossDob.trim() !== "" &&
    bossIdNumber.trim() !== "" &&
    registeredName.trim() !== "" &&
    tradingName.trim() !== "" &&
    registrationNo.trim() !== "" &&
    registeredAddress.trim() !== "" &&
    physicalAddress.trim() !== "" &&
    taxNumber.trim() !== "" &&
    acknowledged &&
    accountNumber.trim() !== "" &&
    debitDay !== "";

  const handleNext = () => {
    onNext({
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
      tax_number: taxNumber,
      vat_number: vatNumber,
      // Payment Details
      bank_name: bank,
      bank_account_number: accountNumber,
      bank_account_type: accountType,
      debit_day_of_month: parseInt(debitDay, 10),
      debit_order_authorised: acknowledged,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(11, 11, 11, 0.72)",
        backdropFilter: "blur(10.5px)",
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="flex flex-col w-full max-w-[550px] max-h-[95vh] rounded-[16px] overflow-hidden shadow-2xl relative"
        style={{
          background: "#1E1E1E",
          color: "#FFFFFF",
          border: "0.625px solid #4A4A4A",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 custom-scrollbar">
          {/* Main Title Area */}
          <div className="text-center space-y-4">
            <h3 className="text-[32px] font-bold text-white leading-tight font-sans">
              Lastly, we need some info for policy servicing and payment
            </h3>
            <p className="text-[20px] text-[#A0A0A0] font-sans">
              Please ensure the info is accurate
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-10 bg-[#2D2D2D] rounded-sm overflow-hidden flex relative items-center border border-[#4A4A4A]">
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
          <div className="space-y-4">
            <label className="text-[16px] font-bold text-white block">
              Are you authorised to act on behalf of the organisation?
            </label>
            <div className="flex flex-col gap-3">
              {[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name="authorised"
                      value={opt.value}
                      checked={authorised === opt.value}
                      onChange={(e) => setAuthorised(e.target.value)}
                      className="w-5 h-5 accent-[#1FC3EB] cursor-pointer"
                    />
                  </div>
                  <span className="text-[15px] text-[#E6E6E6] group-hover:text-white transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Your Details */}
          <div className="space-y-8 pt-4 border-t border-[#2D2D2D]">
            <h4 className="text-[28px] font-bold text-[#1FC3EB]">Your Details</h4>

            {/* Question: Director */}
            <div className="space-y-4">
              <label className="text-[16px] font-bold text-white block">
                Are you a director or member of the organisation?
              </label>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="isDirector"
                      value={opt.value}
                      checked={isDirector === opt.value}
                      onChange={(e) => setIsDirector(e.target.value)}
                      className="w-5 h-5 accent-[#1FC3EB] cursor-pointer"
                    />
                    <span className="text-[15px] text-[#E6E6E6] group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Input fields with consistent styling */}
            {[
              { label: "First name", value: firstName, setter: setFirstName },
              { label: "Surname", value: surname, setter: setSurname },
              { label: "Date of birth (dd/mm/yyyy)", value: dob, setter: setDob, isDate: true },
              { label: "Cellphone", value: cellphone, setter: setCellphone },
              { label: "Landline", value: landline, setter: setLandline, placeholder: "(optional)" },
            ].map((field) => (
              <div key={field.label} className="space-y-2.5">
                <label className="text-[16px] font-bold text-white block">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.isDate ? "date" : "text"}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full h-12 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[15px] text-white focus:border-[#1FC3EB] focus:outline-none transition-all shadow-sm placeholder:text-[#666666] appearance-none"
                    style={{ colorScheme: "dark" }}
                  />
                  {field.isDate && (
                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
                  )}
                </div>
              </div>
            ))}

            {/* Question: SA ID */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-white block">
                Do you have a South African ID Number?
              </label>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="hasSaId"
                      value={opt.value}
                      checked={hasSaId === opt.value}
                      onChange={(e) => setHasSaId(e.target.value)}
                      className="w-4 h-4 accent-[#1FC3EB] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#E6E6E6] group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Input: ID or Passport */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">ID or passport number</label>
              <p className="text-[11px] text-[#A0A0A0]">Used as a password for opening documents containing employee details</p>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Input: Passport Expiry */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">
                Passport expiry (dd/mm/yyyy)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
              </div>
            </div>

            {/* Input: Nationality */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">What is your nationality?</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A0A0A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                <option value="" className="bg-[#1E1E1E]">Please select</option>
                <option value="South African" className="bg-[#1E1E1E]">South African</option>
                <option value="Other" className="bg-[#1E1E1E]">Other</option>
              </select>
            </div>

            {/* Input: Home Address */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Home Address</label>
              <input
                type="text"
                placeholder="Type your address ..."
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white placeholder:text-[#666666] focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Input: Email for Policy */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Email address for policy document and logging in</label>
              <p className="text-[11px] text-[#A0A0A0]">Please note sensitive employee info will be sent to this address</p>
              <input
                type="email"
                value={emailForPolicy}
                onChange={(e) => setEmailForPolicy(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Input: Email for Invoice */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Email address for monthly invoice</label>
              <input
                type="email"
                value={emailForInvoice}
                onChange={(e) => setEmailForInvoice(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section: Boss / MD / CEO details */}
          <div className="space-y-8 pt-4 border-t border-[#2D2D2D]">
            <h4 className="text-[28px] font-bold text-[#1FC3EB]">Boss / MD / CEO details</h4>

            {/* Boss: First Name */}
            <div className="space-y-2.5">
              <label className="text-[16px] font-bold text-white block">First name</label>
              <input
                type="text"
                value={bossFirstName}
                onChange={(e) => setBossFirstName(e.target.value)}
                className="w-full h-12 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[15px] text-white focus:border-[#1FC3EB] focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Boss: Surname */}
            <div className="space-y-2.5">
              <label className="text-[16px] font-bold text-white block">Surname</label>
              <input
                type="text"
                value={bossSurname}
                onChange={(e) => setBossSurname(e.target.value)}
                className="w-full h-12 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[15px] text-white focus:border-[#1FC3EB] focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Boss: DOB */}
            <div className="space-y-2.5">
              <label className="text-[16px] font-bold text-white block">Date of birth (dd/mm/yyyy)</label>
              <div className="relative">
                <input
                  type="date"
                  value={bossDob}
                  onChange={(e) => setBossDob(e.target.value)}
                  className="w-full h-12 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[15px] text-white focus:border-[#1FC3EB] focus:outline-none transition-all shadow-sm appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
              </div>
            </div>

            {/* Boss: SA ID Question */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-white block">
                Does your Boss / MD / CEO have a South African ID Number?
              </label>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="bossHasSaId"
                      value={opt.value}
                      checked={bossHasSaId === opt.value}
                      onChange={(e) => setBossHasSaId(e.target.value)}
                      className="w-4 h-4 accent-[#1FC3EB] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#E6E6E6] group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Boss: ID or Passport */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">ID or passport</label>
              <p className="text-[11px] text-[#A0A0A0]">Used as a password for opening documents containing employee details</p>
              <input
                type="text"
                value={bossIdNumber}
                onChange={(e) => setBossIdNumber(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Boss: Passport Expiry */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Passport expiry (dd/mm/yyyy)</label>
              <div className="relative">
                <input
                  type="date"
                  value={bossPassportExpiry}
                  onChange={(e) => setBossPassportExpiry(e.target.value)}
                  className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors appearance-none"
                  style={{ colorScheme: "dark" }}
                />
                <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] pointer-events-none" />
              </div>
            </div>

            {/* Boss: Nationality */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">What is their nationality?</label>
              <select
                value={bossNationality}
                onChange={(e) => setBossNationality(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A0A0A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                <option value="" className="bg-[#1E1E1E]">Please select</option>
                <option value="South African" className="bg-[#1E1E1E]">South African</option>
                <option value="Other" className="bg-[#1E1E1E]">Other</option>
              </select>
            </div>

            {/* Boss: Home Address */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Home Address</label>
              <input
                type="text"
                placeholder="Type your address ..."
                value={bossHomeAddress}
                onChange={(e) => setBossHomeAddress(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white placeholder:text-[#666666] focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section: Organisation details */}
          <div className="space-y-8 pt-4 border-t border-[#2D2D2D]">
            <h4 className="text-[28px] font-bold text-[#1FC3EB]">Organisation details</h4>
            
            <p className="text-[14px] text-[#EF4444] font-medium leading-relaxed">
              If you cannot fill in the information required in this section, please call us on 021 045 1448
            </p>

            {/* Org: Business Type */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">What kind of business is this?</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#1FC3EB] rounded-lg px-4 text-[14px] text-white focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%231FC3EB' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                <option value="Public (Listed) Company [Ltd]" className="bg-[#1E1E1E]">Public (Listed) Company [Ltd]</option>
                <option value="Private Company (Pty) Ltd" className="bg-[#1E1E1E]">Private Company (Pty) Ltd</option>
                <option value="Sole Proprietor" className="bg-[#1E1E1E]">Sole Proprietor</option>
                <option value="Trust" className="bg-[#1E1E1E]">Trust</option>
              </select>
            </div>

            {/* Org: Country of Inc */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-white block">Country of Incorporation/Registration</label>
              <div className="flex flex-col gap-3">
                {[
                  { label: "South Africa", value: "South Africa" },
                  { label: "Other", value: "Other" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="countryOfInc"
                      value={opt.value}
                      checked={countryOfInc === opt.value}
                      onChange={(e) => setCountryOfInc(e.target.value)}
                      className="w-4 h-4 accent-[#1FC3EB] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#E6E6E6] group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Org: Registered Name */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Registered name</label>
              <input
                type="text"
                value={registeredName}
                onChange={(e) => setRegisteredName(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#1FC3EB] rounded-lg px-4 text-[14px] text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Org: Trading Name */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Trading name</label>
              <input
                type="text"
                value={tradingName}
                onChange={(e) => setTradingName(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Org: Registration No */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Registration no</label>
              <input
                type="text"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Org: Stock Exchange */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Name of Stock Exchange Listing</label>
              <input
                type="text"
                value={stockExchangeName}
                onChange={(e) => setStockExchangeName(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Org: Registered Address */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Registered Address</label>
              <input
                type="text"
                placeholder="Type your address ..."
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white placeholder:text-[#666666] focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Org: Physical Address */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Physical Address</label>
              <p className="text-[11px] text-[#A0A0A0]">Provide Head Office address if there are multiple addresses</p>
              <input
                type="text"
                placeholder="Type your address ..."
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white placeholder:text-[#666666] focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Org: Source of Funds */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-white block">Source of Funds</label>
              <div className="flex flex-col gap-3">
                {["Company profits", "Investment returns", "Donations", "Government"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="sourceOfFunds"
                      value={opt}
                      checked={sourceOfFunds === opt}
                      onChange={(e) => setSourceOfFunds(e.target.value)}
                      className="w-4 h-4 accent-[#1FC3EB] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#E6E6E6] group-hover:text-white transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Org: Tax Number */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Company Tax Number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>

            {/* Org: VAT Number */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Company VAT Number (if applicable)</label>
              <input
                type="text"
                placeholder="(optional)"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white placeholder:text-[#666666] focus:border-[#1FC3EB] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section: Payment details */}
          <div className="space-y-8 pt-4 border-t border-[#2D2D2D]">
            <h4 className="text-[28px] font-bold text-[#1FC3EB]">Payment details</h4>
            
            {/* Legal Mandate Text */}
            <div className="space-y-4 text-[13px] text-[#A0A0A0] leading-relaxed">
              <p>
                I authorise By checking the box below, you authorise to deduct the monthly premium of{" "}
                <strong className="text-white">Rand Mutual Assurance</strong> from R1,436's bank account (details below), 
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
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-5 h-5 accent-[#1FC3EB] rounded bg-[#262626] border-[#4A4A4A] cursor-pointer"
              />
              <span className="text-[15px] font-bold text-white group-hover:text-[#1FC3EB] transition-colors">Acknowledge</span>
            </label>

            {/* Bank Dropdown */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#1FC3EB] rounded-lg px-4 text-[14px] text-white focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%231FC3EB' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                <option value="African Bank" className="bg-[#1E1E1E]">African Bank</option>
                <option value="ABSA" className="bg-[#1E1E1E]">ABSA</option>
                <option value="Capitec" className="bg-[#1E1E1E]">Capitec</option>
                <option value="FNB" className="bg-[#1E1E1E]">FNB</option>
                <option value="Nedbank" className="bg-[#1E1E1E]">Nedbank</option>
                <option value="Standard Bank" className="bg-[#1E1E1E]">Standard Bank</option>
              </select>
            </div>

            {/* Bank Account Number */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-white block">Bank account number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock size={16} className="text-[#666666]" />
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg pl-10 pr-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Bank Account Type */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-white block">Bank account type</label>
              <div className="flex flex-col gap-3">
                {["Cheque", "Current", "Savings", "Transmission"].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="accountType"
                      value={type}
                      checked={accountType === type}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-4 h-4 accent-[#1FC3EB] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#E6E6E6] group-hover:text-white transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Debit Day Dropdown */}
            <div className="space-y-2 pb-8">
              <label className="text-[15px] font-bold text-white block">Which day of the month should we debit the bank account?</label>
              <select
                value={debitDay}
                onChange={(e) => setDebitDay(e.target.value)}
                className="w-full h-11 bg-[#262626] border border-[#4A4A4A] rounded-lg px-4 text-[14px] text-white focus:border-[#1FC3EB] focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A0A0A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={String(day)} className="bg-[#1E1E1E]">{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-center p-8 bg-[#1E1E1E] border-t border-[#3A3A3A] space-y-4 flex-shrink-0">
          <button
            onClick={() => alert("Downloading quote...")}
            className="text-[14px] text-[#1FC3EB] font-medium hover:underline transition-colors"
          >
            Download quote
          </button>

          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className={`w-[240px] h-[50px] rounded-lg font-bold text-[18px] transition-all flex items-center justify-center shadow-lg ${
              !isFormValid ? "opacity-30 cursor-not-allowed bg-[#3A3A3A] text-[#666666]" : "bg-[#F59E0B] text-[#0A0A0A] hover:opacity-90"
            }`}
          >
            Next
          </button>

          <button
            onClick={onClose}
            className="text-[14px] text-[#1FC3EB] font-medium hover:underline transition-colors"
          >
            or go back
          </button>
        </div>
      </div>
    </div>
  );
}
