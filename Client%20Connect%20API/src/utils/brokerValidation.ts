import * as Yup from "yup";
import { 
  PREFERRED_COMMUNICATION_METHOD_OPTIONS, 
  REFERENCE_TYPE_OPTIONS, 
  BANK_ACCOUNT_TYPE_OPTIONS,
  INDUSTRY_TYPE_OPTIONS,
  PROVINCE_OPTIONS,
  GENDER_OPTIONS,
  ID_TYPE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  IDType,
} from "../enums/brokerPortalEnums";

// Lead Management Validations
export const createLeadSchema = Yup.object().shape({
  employerName: Yup.string().required("Employer name cannot be empty"),
  registrationNumber: Yup.string().nullable(),
  industryType: Yup.string().oneOf(INDUSTRY_TYPE_OPTIONS, `Invalid industry type. Valid options are: ${INDUSTRY_TYPE_OPTIONS.join(", ")}`).required("Industry classification cannot be empty"),
  numberOfEmployees: Yup.number().integer("Must be an integer").min(1, "Workforce size must be > 0").required("Employees count is required"),
  averageSalary: Yup.number().min(0, "Average salary must be >= 0").nullable(),
  province: Yup.string().oneOf(PROVINCE_OPTIONS, `Invalid province. Valid options are: ${PROVINCE_OPTIONS.join(", ")}`).required("Province cannot be empty"),
  contactFirstName: Yup.string().nullable().optional(),
  contactLastName: Yup.string().nullable().optional(),
  contactEmail: Yup.string().email("Must be a valid email format").nullable().optional(),
  contactMobile: Yup.string()
    .matches(/^0[6-8]\d{8}$/, "Must be a valid South African mobile number (e.g., 0821234567)")
    .nullable().optional(),
  preferredCommunicationMethod: Yup.string().oneOf(PREFERRED_COMMUNICATION_METHOD_OPTIONS, "Must be valid communication preference").nullable(),
});

export const updateLeadSchema = Yup.object().shape({
  employer: Yup.object().shape({
    employer_name: Yup.string().min(1, "Employer name cannot be empty"),
    registration_number: Yup.string().nullable(),
    industry_type: Yup.string().oneOf(INDUSTRY_TYPE_OPTIONS, "Invalid industry type"),
    number_of_employees: Yup.number().integer("Must be an integer").min(1, "Workforce size must be > 0"),
    average_salary: Yup.number().min(0, "Average salary must be >= 0").nullable(),
    province: Yup.string().oneOf(PROVINCE_OPTIONS, "Invalid province"),
  }).nullable(),
  contact: Yup.object().shape({
    contact_first_name: Yup.string().min(1, "Contact first name cannot be empty").required("First name is required"),
    contact_last_name: Yup.string().min(1, "Contact surname cannot be empty").required("Last name is required"),
    contact_email: Yup.string().email("Must be a valid email format").required("Email is required"),
    contact_mobile: Yup.string().matches(/^0[6-8]\d{8}$/, "Must be a valid South African mobile number").required("Mobile number is required"),
  }).nullable(),
  lastSavedStep: Yup.number().integer().min(1).nullable(),
});

export const cancelLeadSchema = Yup.object().shape({
  reason: Yup.string().min(5, "Reason must be at least 5 characters").required("Reason is required"),
  representativeId: Yup.string().uuid("Invalid representative ID format").optional(),
});

// Quote & Pricing Validations
export const quickQuoteSchema = Yup.object().shape({
  lead_id: Yup.string().uuid("Invalid lead ID").required("Lead ID is required"),
  workforce_count: Yup.number().integer().min(1).required(),
  average_age: Yup.number().min(18).max(70).required(),
  average_salary: Yup.number().min(0).required(),
  province: Yup.string().oneOf(PROVINCE_OPTIONS, "Invalid province").required(),
  industry: Yup.string().oneOf(INDUSTRY_TYPE_OPTIONS, "Invalid industry type").required(),
  gender_split: Yup.string().required(),
  benefits: Yup.array().of(
    Yup.object().shape({
      benefit_type: Yup.string().required(),
      cover_amount: Yup.number().min(0).optional(),
    })
  ).required(),
});

export const fullQuoteSchema = Yup.object().shape({
  lead_id: Yup.string().uuid("Invalid lead ID").required("Lead ID is required"),
  product_id: Yup.string().uuid("Invalid product ID").optional(),
  rma_member_number: Yup.string().nullable(),
  is_permanent_employees: Yup.boolean().nullable(),
  is_actively_at_work: Yup.boolean().nullable(),
  is_replacing_policy: Yup.boolean().nullable(),
  replaced_policy_includes_disability: Yup.boolean().nullable(),
  is_policy_older_than_6_months: Yup.boolean().nullable(),
  replaced_policy_start_date: Yup.date().nullable(),
  province: Yup.string().oneOf(PROVINCE_OPTIONS, "Invalid province").nullable(),
  benefits: Yup.array().of(
    Yup.object().shape({
      benefit_type: Yup.string().required(),
      multiple: Yup.number().min(0).optional(),
      cover_amount: Yup.number().min(0).optional(),
    })
  ).required(),
});

export const sendOtpSchema = Yup.object().shape({
  quoteId: Yup.string().uuid("Invalid quote ID").required("Quote ID is required"),
});

export const verifyOtpSchema = Yup.object().shape({
  quoteId: Yup.string().uuid("Invalid quote ID").required("Quote ID is required"),
  otpCode: Yup.string().matches(/^\d{6}$/, "Must be exactly 6 digits").required(),
});

export const employerOnboardingSchema = Yup.object().shape({
  // Authorisation & Your Details
  is_authorised: Yup.boolean().required("Authorisation status is required"),
  is_director: Yup.boolean().required("Director status is required"),
  first_name: Yup.string().required("First name is required"),
  surname: Yup.string().required("Surname is required"),
  date_of_birth: Yup.date().required("Date of birth is required"),
  cellphone: Yup.string().required("Cellphone is required"),
  landline: Yup.string().nullable(),
  has_sa_id: Yup.boolean().required(),
  id_or_passport_number: Yup.string().required("ID or Passport number is required"),
  passport_expiry: Yup.date().nullable().when("has_sa_id", {
    is: false,
    then: (schema) => schema.required("Passport expiry is required for non-SA citizens"),
  }),
  nationality: Yup.string().required("Nationality is required"),
  home_address: Yup.string().required("Home address is required"),
  email_for_policy_documents: Yup.string().email("Invalid email").required("Email for policy documents is required"),
  email_for_monthly_invoice: Yup.string().email("Invalid email").required("Email for monthly invoice is required"),

  // Boss Details
  boss_first_name: Yup.string().required("Boss first name is required"),
  boss_surname: Yup.string().required("Boss surname is required"),
  boss_date_of_birth: Yup.date().required("Boss date of birth is required"),
  boss_has_sa_id: Yup.boolean().required(),
  boss_id_or_passport: Yup.string().required("Boss ID or Passport is required"),
  boss_passport_expiry: Yup.date().nullable().when("boss_has_sa_id", {
    is: false,
    then: (schema) => schema.required("Boss passport expiry is required for non-SA citizens"),
  }),
  boss_nationality: Yup.string().required("Boss nationality is required"),

  // Organisation Details
  business_type: Yup.string().required("Business type is required"),
  country_of_incorporation: Yup.string().required("Country of incorporation is required"),
  registered_name: Yup.string().required("Registered name is required"),
  trading_name: Yup.string().required("Trading name is required"),
  registration_number: Yup.string().required("Registration number is required"),
  stock_exchange_listing_name: Yup.string().nullable(),
  registered_address: Yup.string().required("Registered address is required"),
  physical_address: Yup.string().required("Physical address is required"),

  // Payment Details
  bank_name: Yup.string().required("Bank name is required"),
  bank_account_number: Yup.string().required("Bank account number is required"),
  bank_account_type: Yup.string().oneOf(BANK_ACCOUNT_TYPE_OPTIONS, "Invalid account type").required(),
  debit_day_of_month: Yup.number().integer().min(1).max(31).required("Debit day is required"),
  source_of_funds: Yup.string().required("Source of funds is required"),
  company_tax_number: Yup.string().required("Company tax number is required"),
  company_vat_number: Yup.string().nullable(),
  debit_order_authorised: Yup.boolean().oneOf([true], "Debit order must be authorised").required(),
});

export const brokerEmployeeSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  surname: Yup.string().required("Surname is required"),
  gender: Yup.string().oneOf(GENDER_OPTIONS, "Invalid gender").required("Gender is required"),
  income: Yup.number().positive("Income must be a positive number").required("Income is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  cellNumber: Yup.string()
    .matches(/^0[6-8]\d{8}$/, "Invalid cell number format")
    .required("Cell number is required"),
  employmentStartDate: Yup.date().required("Employment start date is required"),
  idType: Yup.string()
    .oneOf(ID_TYPE_OPTIONS, `Invalid ID type. Valid options: ${ID_TYPE_OPTIONS.join(", ")}`)
    .required("ID type is required"),
  idNumber: Yup.string().when("idType", {
    is: IDType.SA_ID,
    then: (schema) => schema.required("SA ID number is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  passportNumber: Yup.string().when("idType", {
    is: IDType.PASSPORT,
    then: (schema) => schema.required("Passport number is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  employmentStatus: Yup.string()
    .oneOf(EMPLOYMENT_STATUS_OPTIONS, `Invalid employment status. Valid options: ${EMPLOYMENT_STATUS_OPTIONS.join(", ")}`)
    .nullable(),
  nationality: Yup.string().required("Nationality is required"),
});

export const brokerImportEmployeesSchema = Yup.object().shape({
  lead_id: Yup.string().uuid("Invalid lead ID").required("Lead ID is required"),
  employees: Yup.array().of(brokerEmployeeSchema).min(5, "At least 5 employees are required for submission").required("Employees array is required"),
});

