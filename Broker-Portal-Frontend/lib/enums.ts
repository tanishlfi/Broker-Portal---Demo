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
  SMS = "SMS",
}

export enum BenefitType {
  LIFE = "Life",
  FUNERAL = "Funeral",
  ACCIDENT = "Accident",
  VAPS = "VAPS",
}

export enum ChangeType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum SentMethod {
  EMAIL = "Email",
  SMS = "SMS",
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

export enum RolePlayerTypeEnums {
  POLICY_OWNER = 1,
  POLICY_PAYEE = 2,
  INSURED_LIFE = 3,
  FINANCIAL_SERVICE_PROVIDER = 4,
  CLAIMANT = 5,
  MEDICAL_SERVICE_PROVIDER = 6,
  FUNERAL_PARLOR = 7,
  BODY_COLLECTOR = 8,
  UNDERTAKER = 9,
  MAIN_MEMBER_SELF = 10,
  SPOUSE = 11,
  DAUGHTER = 12,
  DAUGHTER_IN_LAW = 13,
  SON_IN_LAW = 14,
  SON = 15,
  PARENT = 16,
  PARENT_IN_LAW = 17,
  GRAND_PARENT = 18,
  MOTHER = 19,
  MOTHER_IN_LAW = 20,
  FATHER = 21,
  FATHER_IN_LAW = 22,
  BROTHER = 23,
  BROTHER_IN_LAW = 24,
  SISTER = 25,
  SISTER_IN_LAW = 26,
  AUNT = 27,
  NIECE = 28,
  NEPHEW = 29,
  HUSBAND = 30,
  WIFE = 31,
  CHILD = 32,
  SPECIAL_CHILD = 33,
  OTHER = 34,
  GUARDIAN_RECIPIENT = 35,
  PERSON_INDIVIDUAL = 36,
  PENSIONER = 37,
  EXTENDED = 38,
  DISABLED_CHILD = 39,
  UNCLE = 40,
  BENEFICIARY = 41,
  COUSIN = 42,
  GRAND_CHILD = 44,
  FRIEND = 45,
}

export enum CoverMemberTypeEnums {
  MAIN_MEMBER = 1,
  SPOUSE = 2,
  CHILD = 3,
  EXTENDED_FAMILY = 4,
  STILL_BORN = 5,
  NOT_APPLICABLE = 6,
}

export enum ParserCoverMemberTypeEnums {
  spouse = 2,
  children = 3,
  extended = 4,
}

export enum RecommenderEnums {
  RECOMMENDATION = 1,
  SECOND_RECOMMENDATION = 2,
}

// Option arrays (for dropdowns, filters, etc.)
export const LEAD_STATUS_OPTIONS = Object.values(LeadStatus);
export const QUOTE_TYPE_OPTIONS = Object.values(QuoteType);
export const QUOTE_STATUS_OPTIONS = Object.values(QuoteStatus);
export const VERIFICATION_STATUS_OPTIONS = Object.values(VerificationStatus);
export const PREFERRED_COMMUNICATION_METHOD_OPTIONS = Object.values(PreferredCommunicationMethod);
export const REFERENCE_TYPE_OPTIONS = Object.values(ReferenceType);
export const BANK_ACCOUNT_TYPE_OPTIONS = Object.values(BankAccountType);
export const BENEFIT_TYPE = Object.values(BenefitType);
export const CHANGE_TYPE = Object.values(ChangeType);
export const SENT_METHOD = Object.values(SentMethod);
export const OTP_STATUS_OPTIONS = Object.values(OTPStatus);
export const INDUSTRY_TYPE_OPTIONS = Object.values(IndustryType);
export const PROVINCE_OPTIONS = Object.values(Province);
export const GENDER_OPTIONS = Object.values(Gender);
export const AUDIT_EVENT_TYPE = Object.values(AuditEventType);
export const ACTION_OUTCOME = Object.values(ActionOutcome);
