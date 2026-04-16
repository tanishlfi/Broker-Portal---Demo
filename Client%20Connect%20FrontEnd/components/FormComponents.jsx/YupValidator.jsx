import * as Yup from "yup";

export const AllBrokkerSchama = {
  DisplayName: Yup.string()
    .required("The Display Name is required")
    .max(50, "Display Name cannot be longer than 50 characters"),
  CompanyTypeId: Yup.number()
    .required("Company Type ID is required")
    .positive("Company Type ID must be a positive number")
    .integer("Company Type ID must be an integer"),

  RepresentativeId: Yup.number().required("Representative ID is required"),
  ProductOptionID: Yup.number().required("Product Option ID is required"),
  IdNumber: Yup.string()
    .required("ID number is required")
    .matches(
      /(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/,
      "SA Id Number seems to be invalid"
    ),
  CellNumber: Yup.string()
    .transform((value) => value.replace(/\D/g, "")) // Remove non-digit characters before validation
    .matches(/^0[6-8]\d{8}$/, "Mobile phone number must be 10 digits long and start with 06, 07 or 08")
    .required("Cellphone number is required"),
  TellNumber: Yup.string()
    .transform((value) => value.replace(/\D/g, "")) // Remove non-digit characters before validation
    .matches(/^0\d{9}$/, "Must be a valid South African TellNumber number")
    .required("TellNumber number is required"),
  EmailAddress: Yup.string().required("Email Address is required"),
  VatRegistrationNumber: Yup.string()
    .required("Vat Registration Number is required")
    .matches(
      /^4\d{9}$/,
      "Vat Registration Number must be a valid South African VAT number"
    ),
  JoinDate: Yup.string().required("Join Date is required"),
  AccountNumber: Yup.string()
    .min(9, "Account number should be at least 9 digits")
    .max(16, "Account number cannot have more than 16 digits")
    .matches(/^\d+$/, {
      message: "Account number should be only numbers",
    })
    .required("Account number is required"),
  AccountHolderName: Yup.string().required("Account holder is required"),
  BankAccountType: Yup.string().required("Account type is required"),
  BankBranchId: Yup.string().required("Bank branch ID is required"),
  BranchCode: Yup.string()
    .min(5, "Branch code should be at least 6 digits")
    .max(11, "Branch code cannot have more than 11 digits")
    .matches(/^\d+$/, { message: "Branch code should be only numbers" })
    .required("Branch code is required"),
  ReferenceNo: Yup.string().required("Reference Number is required"),
  ExpiryDate: Yup.date().required("expiry date is required"),
  GeneratedDate: Yup.string().required("generated Date is required"),
  Lives: Yup.number()
    .typeError("Lives must be a number")
    .required("Number of Lives is required"),
  Premium: Yup.number()
    .typeError("Premium must be a number")
    .required("Premium amount is required"),

  CommissionFee: Yup.number()
    .typeError("Commission Fee must be a number")
    .required("Commission Fee is required"),
  ServiceFee: Yup.number()
    .typeError("Service Fee must be a number")
    .required("Service Fee is required"),
  BinderFee: Yup.number()
    .typeError("Binder Fee must be a number")
    .required("Binder Fee is required"),
  PayDate: Yup.date().required("Pay Date is required"),
  PaymentMethod: Yup.string().required("Payment Method is required"),
  PaymentFrequency: Yup.string().required("Payment Frequency is required"),
  AddressLine1: Yup.string().required("Your Postal address line 1 Required"),
  AddressLine2: Yup.string().required("Your Postal address line 2 Required"),
  City: Yup.string().required("Your City Required"),
  Province: Yup.string().required("Province is Required"),
  PostalCode: Yup.string().required("Postal code is Required"),
  AccountNumber: Yup.string()
    .min(9, "Account number should be at least 9 digits")
    .max(16, "Account number cannot have more than 16 digits")
    .matches(/^\d+$/, {
      message: "Account number should be only numbers",
    })
    .required("Account number is required"),
  BankName: Yup.string().required("Bank name is required"),
  AccountHolderInitials: Yup.string().required("Account initials is required"),
  AccountHolderSurname: Yup.string().required("Account surname is required"),

  idNumber: Yup.string()
    .required("ID number is required")
    .matches(/^\d{13}$/, "SA Id Number is invalid"),
  BankAccountType: Yup.string().required("Account type is required"),
  BranchCode: Yup.string()
    .min(5, "Branch code should be at least 6 digits")
    .max(11, "Branch code cannot have more than 11 digits")
    .matches(/^\d+$/, { message: "Branch code should be only numbers" })
    .required("Branch code is required"),
  OriginalFileName: Yup.string().required("File name is required"),
  FileName: Yup.string().required("File name is required"),
  DocumentType: Yup.string().required("Please select a document type"),
  createdAt: Yup.date().required("Created Date is required"),
  note: Yup.string().required("Note is required"),
  created_by: Yup.string().required("Created by is required"),
  active: Yup.string().required("Active is required"),
};

export const BrokerStatus = {
  status: Yup.string()
    .required("Please select a status")
    .oneOf(
      ["Draft", "Processing", "Submitted", "rejected", "Accepted"],
      "Invalid status"
    ),
};

export const QoutesStatus = {
  status: Yup.string()
    .required("Please select a status")
    .oneOf(["Accepted", "Rejected", "Awaiting Feedback"], "Invalid status"),
};

export const BankingStatus = {
  status: Yup.string()
    .required("Please select a status")
    .oneOf(["pending", "Rejected", "Approved"], "Invalid status"),
};
