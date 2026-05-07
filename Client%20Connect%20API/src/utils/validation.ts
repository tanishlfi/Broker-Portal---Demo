import * as Yup from "yup";

// Lead Management Validations
export const createLeadSchema = Yup.object().shape({
  employerName: Yup.string().required("Employer name cannot be empty"),
  registrationNumber: Yup.string().nullable(),
  industryType: Yup.string().required("Industry classification cannot be empty"),
  numberOfEmployees: Yup.number().integer("Must be an integer").min(1, "Workforce size must be > 0").required("Employees count is required"),
  averageSalary: Yup.number().min(0, "Average salary must be >= 0").nullable(),
  province: Yup.string().required("Province cannot be empty"),
  contactFirstName: Yup.string().required("Contact first name cannot be empty"),
  contactLastName: Yup.string().required("Contact surname cannot be empty"),
  contactEmail: Yup.string().email("Must be a valid email format").required("Email cannot be empty"),
  contactMobile: Yup.string()
    .matches(/^0[6-8]\d{8}$/, "Must be a valid South African mobile number (e.g., 0821234567)")
    .required("Mobile cannot be empty"),
  preferredCommunicationMethod: Yup.string().oneOf(["Email", "SMS", "Phone"], "Must be valid communication preference").nullable(),
  representativeId: Yup.string().uuid("Must be valid ID format").required("Representative ID is required"),
  brokerId: Yup.string().uuid("Must be valid ID format").required("Broker ID is required"),
});

export const updateLeadSchema = Yup.object().shape({
  employer: Yup.object().shape({
    employer_name: Yup.string().min(1, "Employer name cannot be empty"),
    registration_number: Yup.string().nullable(),
    industry_type: Yup.string().min(1, "Industry classification cannot be empty"),
    number_of_employees: Yup.number().integer("Must be an integer").min(1, "Workforce size must be > 0"),
    average_salary: Yup.number().min(0, "Average salary must be >= 0").nullable(),
    province: Yup.string().min(1, "Province cannot be empty"),
  }).nullable(),
  contact: Yup.object().shape({
    contact_first_name: Yup.string().min(1, "Contact first name cannot be empty"),
    contact_last_name: Yup.string().min(1, "Contact surname cannot be empty"),
    contact_email: Yup.string().email("Must be a valid email format"),
    contact_mobile: Yup.string().matches(/^0[6-8]\d{8}$/, "Must be a valid South African mobile number"),
    preferred_communication_method: Yup.string().oneOf(["Email", "SMS", "Phone"], "Must be valid communication preference"),
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
  province: Yup.string().required(),
  industry: Yup.string().required(),
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
  benefits: Yup.array().of(
    Yup.object().shape({
      benefit_type: Yup.string().required(),
      multiple: Yup.number().min(0).optional(),
      cover_amount: Yup.number().min(0).optional(),
    })
  ).required(),
});
