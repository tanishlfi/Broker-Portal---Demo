/**
 * Validation utilities for Broker Portal
 * Based on Client Connect FrontEnd validation rules
 */

// South African ID Number Validator
export const validateSAIDNumber = (idNumber: string): boolean => {
  // Remove all spaces from idNumber
  idNumber = String(idNumber).replace(/\s/g, "");

  // Regex check if idNumber contains only numbers
  const regex = /^[0-9]+$/;
  if (!regex.test(idNumber)) {
    return false;
  }

  // Check if idNumber is 13 digits
  const idLength = idNumber.length;
  if (idLength !== 13) {
    return false;
  }

  // Check if first 6 digits are a valid date
  let year = Number(idNumber.substring(0, 2));
  const month = Number(idNumber.substring(2, 4));
  const day = Number(idNumber.substring(4, 6));

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  // Set dob to date object
  let dob = new Date(year, month - 1, day);

  // Calculate age from dob
  let age = new Date().getFullYear() - dob.getFullYear();

  // Assume age is less than 100
  if (age > 100) {
    dob = new Date(year + 2000, month - 1, day);
  }

  // Luhn algorithm to validate checksum
  let luhn1 = 0;
  let luhn2 = "";
  for (let i = 0; i < idLength - 1; i++) {
    if (i % 2 === 0) {
      luhn1 += Number(idNumber.substring(i, i + 1));
    } else {
      luhn2 = luhn2.concat(idNumber.substring(i, i + 1));
    }
  }

  luhn2 = String(Number(luhn2) * 2);

  for (let i = 0; i < luhn2.length; i++) {
    luhn1 += Number(luhn2.substring(i, i + 1));
  }

  luhn1 =
    String(luhn1).substring(1, 2) === "0"
      ? 0
      : 10 - Number(String(luhn1).substring(1, 2));

  // Check if last digit is equal to luhn1
  if (luhn1 !== Number(idNumber.substring(idLength - 1, idLength))) {
    return false;
  }

  // Check if last 7 characters are 0000000
  if (idNumber.substring(6, 13) === "0000000") {
    return false;
  }

  return true;
};

// South African Phone Number Validator (Mobile)
export const validateSAMobileNumber = (phone: string): boolean => {
  const cleaned = String(phone).replace(/\D/g, "");
  return /^0[6-8]\d{8}$/.test(cleaned);
};

// South African Telephone Number Validator
export const validateSATelephoneNumber = (phone: string): boolean => {
  const cleaned = String(phone).replace(/\D/g, "");
  return /^0\d{9}$/.test(cleaned);
};

// Email Validator
export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

// Postal Code Validator (4 digits)
export const validatePostalCode = (postalCode: string): boolean => {
  return /^\d{4}$/.test(postalCode);
};

// Bank Account Number Validator
export const validateAccountNumber = (accountNumber: string): boolean => {
  const cleaned = String(accountNumber).replace(/\D/g, "");
  return cleaned.length >= 9 && cleaned.length <= 16 && /^\d+$/.test(cleaned);
};

// Branch Code Validator
export const validateBranchCode = (branchCode: string): boolean => {
  const cleaned = String(branchCode).replace(/\D/g, "");
  return cleaned.length >= 5 && cleaned.length <= 11 && /^\d+$/.test(cleaned);
};

// Account Holder Initials Validator
export const validateInitials = (initials: string): boolean => {
  return /^[A-Za-z](\.[A-Za-z])*\.?$/.test(initials);
};

// Surname Validator (letters only)
export const validateSurname = (surname: string): boolean => {
  return /^[a-zA-Z]+$/.test(surname);
};

// VAT Registration Number Validator (South African)
export const validateVATNumber = (vat: string): boolean => {
  const cleaned = String(vat).replace(/\D/g, "");
  return /^4\d{9}$/.test(cleaned);
};

// Company Name Validator
export const validateCompanyName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 100;
};

// Registration Number Validator (optional, can be any string if provided)
export const validateRegistrationNumber = (regNo: string): boolean => {
  // Registration number is optional, but if provided should not be empty
  if (!regNo || regNo.trim().length === 0) {
    return true; // Optional field
  }
  // If provided, should be a valid string (no specific format required)
  return regNo.trim().length > 0 && regNo.trim().length <= 50;
};

// Display Name Validator
export const validateDisplayName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 50;
};

// First Name Validator
export const validateFirstName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 50;
};

// Contact Person Name Validator (cannot start with number)
export const validateContactPersonName = (name: string): boolean => {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    return false;
  }
  // Must not start with a number
  return !/^\d/.test(trimmed);
};

// Number Validator (positive integers)
export const validatePositiveNumber = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Number Validator (positive decimals)
export const validatePositiveDecimal = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

// Address Line Validator
export const validateAddressLine = (address: string): boolean => {
  return address.trim().length > 0 && address.trim().length <= 100;
};

// City Validator
export const validateCity = (city: string): boolean => {
  return city.trim().length > 0 && city.trim().length <= 50;
};

// Generic Required Field Validator
export const validateRequired = (value: string | number | undefined): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== undefined && value !== null;
};
