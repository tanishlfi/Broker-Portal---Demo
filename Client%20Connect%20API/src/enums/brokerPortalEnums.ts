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
