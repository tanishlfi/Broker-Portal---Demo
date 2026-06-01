import { object } from "yup";

export enum LeadStatus {
  DRAFT = "Draft",
  IN_PROGRESS = "In Progress",
  QUOTE_GENERATED = "Quote Generated",
  AWAITING_EMPLOYER_ACCEPTANCE = "Awaiting Employer Acceptance",
  ACCEPTED = "Accepted",
  ONBOARDING_SUBMITTED = "Onboarding Submitted",
  PENDING_APPROVAL = "Pending Approval",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  EXPIRED = "Expired",
  CANCELLED = "Cancelled",
  POLICY_CREATED = "Policy Created",
}

export enum QuoteType {
  QUICK = "Quick",
  FULL = "Full",
}

export enum QuoteStatus {
  DRAFT = "Draft",
  GENERATED = "Generated",
  REVISED = "Revised",
  AWAITING_EMPLOYER_ACCEPTANCE = "Awaiting Employer Acceptance",
  ACCEPTED = "Accepted",
  ONBOARDING_SUBMITTED = "Onboarding Submitted",
  EXPIRED = "Expired",
  REJECTED = "Rejected",
}

export enum VerificationStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  FAILED = "Failed",
}

export enum PreferredCommunicationMethod {
  EMAIL = "Email",
  SMS = "SMS"
}

export enum BenefitType {
  LIFE = "Life",
  FUNERAL = "Funeral",
  ACCIDENT = "Accident",
  VAPS = 'VAPS'
}

export enum ChangeType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

export enum SentMethod {
  EMAIL = "Email",
  SMS = "SMS"
}
export enum ReferenceType {
  LEAD = "Lead",
  QUOTE = "Quote",
}

export enum BankAccountType {
  CHEQUE = "Cheque",
  CURRENT = "Current",
  SAVINGS = "Savings",
  TRANSMISSION = "Transmission",
}

export enum OTPStatus {
  GENERATED = "Generated",
  SENT = "Sent",
  VERIFIED = "Verified",
  EXPIRED = "Expired",
  FAILED = "Failed",
}

export enum IndustryType {
  MINING = "Mining",
  CONSTRUCTION = "Construction",
  RETAIL = "Retail",
  MANUFACTURING = "Manufacturing",
  TRANSPORT = "Transport",
  AGRICULTURE = "Agriculture",
  FINANCIAL_SERVICES = "Financial Services",
  SERVICES = "Services",
  GOVERNMENT = "Government",
  OTHER = "Other",
}

export enum Province {
  GAUTENG = "Gauteng",
  WESTERN_CAPE = "Western Cape",
  KWAZULU_NATAL = "KwaZulu-Natal",
  EASTERN_CAPE = "Eastern Cape",
  LIMPOPO = "Limpopo",
  MPUMALANGA = "Mpumalanga",
  NORTH_WEST = "North West",
  FREE_STATE = "Free State",
  NORTHERN_CAPE = "Northern Cape",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
  PREFER_NOT_TO_SAY = "Prefer Not to Say",
}

export enum AuditEventType {
  LEAD_CREATED = "Lead Created",
  LEAD_UPDATED = "Lead Updated",
  QUOTE_GENERATED = "Quote Generated",
  QUOTE_DOWNLOADED = "Quote Downloaded",
  OTP_VERIFIED = "OTP Verified",
  ONBOARDING_SUBMITTED = "Onboarding Submitted",
  AML_STORED = "AML Stored",
  VOPD_STORED = "VOPD Stored",
  POLICY_CREATED = "Policy Created",
  DOCUMENT_GENERATED = "Document Generated",
  DOCUMENT_DOWNLOADED = "Document Downloaded",
  NOTIFICATION_SENT = "Notification Sent",
  EMPLOYEE_IMPORT = "Employee Import",
}

export enum ActionOutcome {
  SUCCESS = "Success",
  FAILURE = "Failure",
  WARNING = "Warning",
}

export enum IDType {
  SA_ID = "South African ID",
  PASSPORT = "Passport",
}

export enum EmploymentStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  NEW_JOINER = "New Joiner",
  TERMINATED = "Terminated",
}

export const LEAD_STATUS_OPTIONS = Object.values(LeadStatus);
export const QUOTE_TYPE_OPTIONS = Object.values(QuoteType);
export const QUOTE_STATUS_OPTIONS = Object.values(QuoteStatus);
export const VERIFICATION_STATUS_OPTIONS = Object.values(VerificationStatus);
export const PREFERRED_COMMUNICATION_METHOD_OPTIONS = Object.values(PreferredCommunicationMethod);
export const REFERENCE_TYPE_OPTIONS = Object.values(ReferenceType);
export const BANK_ACCOUNT_TYPE_OPTIONS = Object.values(BankAccountType);
export const BENEFIT_TYPE = Object.values(BenefitType);
export const CHANGE_TYPE = Object.values(ChangeType);
export const SENT_METHOD = Object.values(SentMethod)
export const OTP_STATUS_OPTIONS = Object.values(OTPStatus);
export const INDUSTRY_TYPE_OPTIONS = Object.values(IndustryType);
export const PROVINCE_OPTIONS = Object.values(Province);
export const GENDER_OPTIONS = Object.values(Gender);
export const AUDIT_EVENT_TYPE = Object.values(AuditEventType);
export const ACTION_OUTCOME = Object.values(ActionOutcome);
export const ID_TYPE_OPTIONS = Object.values(IDType);
export const EMPLOYMENT_STATUS_OPTIONS = Object.values(EmploymentStatus);
