import * as XLSX from "xlsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD", "D/M/YYYY", "MM/DD/YYYY"];

export interface EmployeeUploadResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  employees: any[];
  errors: Array<{ row: number; errors: string[] }>;
}

export const parseAndValidateEmployeesFile = (
  fileBuffer: Buffer,
): EmployeeUploadResult => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

  const result: EmployeeUploadResult = {
    totalRows: 0,
    validCount: 0,
    invalidCount: 0,
    employees: [],
    errors: [],
  };

  const columnMapping: Record<string, string> = {
    "First name": "first_name",
    Surname: "last_name",
    Gender: "gender",
    Income: "salary",
    "Date of birth": "date_of_birth",
    Email: "email",
    "Cell number": "cell_number",
    "Employment start date": "employment_start_date",
    "ID/Passport number": "id_number",
    "Passport expiry": "passport_expiry",
    Nationality: "nationality",
  };

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const rowErrors: string[] = [];
    const normalizedRow: any = {};
    for (const key in row) {
      normalizedRow[key.trim()] = row[key];
    }
    const employeeData: any = {};
    for (const [excelCol, dbCol] of Object.entries(columnMapping)) {
      let val = normalizedRow[excelCol] !== undefined ? normalizedRow[excelCol] : "";
      if (typeof val === "string") val = val.trim();
      employeeData[dbCol] = val;
    }

    if (!employeeData.first_name) rowErrors.push("First name is required.");
    if (!employeeData.last_name) rowErrors.push("Surname is required.");
    if (employeeData.salary !== "" && employeeData.salary !== null) {
      const salaryNum = parseFloat(employeeData.salary);
      if (isNaN(salaryNum) || salaryNum <= 0) {
        rowErrors.push("Income must be a valid positive number.");
      } else {
        employeeData.salary = salaryNum;
      }
    } else {
      rowErrors.push("Income is required.");
    }

    if (!employeeData.id_number) {
      rowErrors.push("ID/Passport number is required.");
    }

    if (employeeData.date_of_birth) {
      // Try parsing with known formats, or fallback to default dayjs parsing for Date objects
      const dob = dayjs(employeeData.date_of_birth, DATE_FORMATS);
      if (!dob.isValid()) {
        rowErrors.push("Date of birth is invalid. Use DD/MM/YYYY or YYYY-MM-DD.");
      } else {
        employeeData.date_of_birth = dob.format("YYYY-MM-DD");
      }
    } else {
      rowErrors.push("Date of birth is required.");
    }

    if (employeeData.employment_start_date) {
      const empDate = dayjs(employeeData.employment_start_date, DATE_FORMATS);
      if (!empDate.isValid()) {
        rowErrors.push("Employment start date is invalid.");
      } else {
        employeeData.employment_start_date = empDate.format("YYYY-MM-DD");
      }
    }

    if (employeeData.passport_expiry) {
      const expiryDate = dayjs(employeeData.passport_expiry, DATE_FORMATS);
      if (!expiryDate.isValid()) {
        rowErrors.push("Passport expiry date is invalid.");
      } else {
        employeeData.passport_expiry = expiryDate.format("YYYY-MM-DD");
      }
    }

    if (employeeData.email) {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(employeeData.email)) {
        rowErrors.push("Email is invalid.");
      }
    }

    const isValid = rowErrors.length === 0;

    if (!isValid) {
      result.invalidCount++;
      result.errors.push({ row: rowNum, errors: rowErrors });
    } else {
      result.validCount++;
    }

    result.employees.push({
      ...employeeData,
      is_valid: isValid,
      validation_errors: rowErrors.length > 0 ? rowErrors : null,
    });
  });

  result.totalRows = rows.length;

  return result;
};
