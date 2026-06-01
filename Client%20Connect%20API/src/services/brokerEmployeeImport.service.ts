const { sequelize } = require("../models");
import { BrokerEmployeeRepository } from "../repositories/brokerEmployee.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
import { AuditService } from "./auditService";
import { AuditEventType, ActionOutcome, IDType, EmploymentStatus } from "../enums/brokerPortalEnums";
import { v4 as uuidv4 } from "uuid";

const employeeRepo = new BrokerEmployeeRepository();
const leadRepo = new BrokerLeadRepository();

export interface BrokerImportResult {
  success: boolean;
  totalEmployees: number;
  insertedEmployees: number;
  duplicateEmployees: number;
  message?: string;
}

export const brokerImportEmployeesService = async (
  leadId: string, 
  employees: any[], 
  representativeId: string, 
  ipAddress?: string
): Promise<BrokerImportResult> => {
  const t = await sequelize.transaction();

  try {
    // 1. Verify Lead Exists via Repository
    const lead = await leadRepo.findById(leadId, { transaction: t });
    if (!lead) {
      await t.rollback();
      
      await AuditService.logEvent({
        eventType: AuditEventType.EMPLOYEE_IMPORT,
        outcome: ActionOutcome.FAILURE,
        userId: representativeId,
        metadata: { leadId, error: "Lead not found" },
        ipAddress
      });

      return {
        success: false,
        totalEmployees: employees.length,
        insertedEmployees: 0,
        duplicateEmployees: 0,
        message: "Lead not found. Please provide a valid Lead ID.",
      };
    }

    // 2. Duplicate Detection via Repository
    const existingEmployees = await employeeRepo.findByIdNumbers(leadId, t);
    const existingIdNumbers = new Set(existingEmployees.map((emp: any) => emp.id_number));
    
    const employeesToInsert: any[] = [];
    let duplicateCount = 0;

    employees.forEach((emp) => {
      if (existingIdNumbers.has(emp.idNumber)) {
        duplicateCount++;
      } else {
        employeesToInsert.push({
          employee_id: uuidv4(),
          lead_id: leadId,
          first_name: emp.firstName,
          last_name: emp.surname,
          gender: emp.gender,
          salary: emp.income,
          date_of_birth: emp.dateOfBirth,
          id_type: emp.idType || IDType.SA_ID,
          id_number: emp.idNumber || null,
          passport_number: emp.passportNumber || null,
          employment_status: emp.employmentStatus || null,
          is_active: true,
        });
        existingIdNumbers.add(emp.idNumber);
      }
    });

    // 3. Bulk Insert via Repository
    if (employeesToInsert.length > 0) {
      await employeeRepo.bulkCreate(employeesToInsert, t);
    }

    await t.commit();

    await AuditService.logEvent({
      eventType: AuditEventType.EMPLOYEE_IMPORT,
      outcome: duplicateCount > 0 ? ActionOutcome.WARNING : ActionOutcome.SUCCESS,
      userId: representativeId,
      metadata: { 
        leadId, 
        total: employees.length, 
        inserted: employeesToInsert.length, 
        duplicates: duplicateCount 
      },
      ipAddress
    });

    return {
      success: true,
      totalEmployees: employees.length,
      insertedEmployees: employeesToInsert.length,
      duplicateEmployees: duplicateCount,
    };
  } catch (error: any) {
    if (t) await t.rollback();
    console.error("BROKER IMPORT EMPLOYEES SERVICE ERROR:", error);

    await AuditService.logEvent({
      eventType: AuditEventType.EMPLOYEE_IMPORT,
      outcome: ActionOutcome.FAILURE,
      userId: representativeId,
      metadata: { leadId, error: error.message },
      ipAddress
    });

    throw error;
  }
};

export const getEmployeesByLeadIdService = async (leadId: string) => {
  try {
    const employees = await employeeRepo.findByLeadId(leadId);

    // Derive Age from DateOfBirth per spec 5.6 (Age is system-derived, not stored)
    const today = new Date();
    const enriched = employees.map((emp: any) => {
      const plain = emp.get ? emp.get({ plain: true }) : { ...emp };
      if (plain.date_of_birth) {
        const dob = new Date(plain.date_of_birth);
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        plain.age = age;
      } else {
        plain.age = null;
      }
      return plain;
    });

    return {
      success: true,
      data: enriched,
    };
  } catch (error: any) {
    console.error("GET EMPLOYEES BY LEAD ID SERVICE ERROR:", error);
    throw error;
  }
};

export const updateEmployeeService = async (
  leadId: string,
  employeeId: string,
  data: any,
  representativeId: string,
  ipAddress?: string
) => {
  const t = await sequelize.transaction();
  try {
    const lead = await leadRepo.findOne({
      where: { lead_id: leadId, representative_id: representativeId },
      transaction: t
    });

    if (!lead) {
      await t.rollback();
      return {
        success: false,
        message: "Lead not found or access denied",
      };
    }

    const employee = await employeeRepo.findByLeadAndId(leadId, employeeId, t);
    if (!employee) {
      await t.rollback();
      return {
        success: false,
        message: "Employee not found in this lead",
      };
    }

    if (!employee.is_active) {
      await t.rollback();
      return {
        success: false,
        message: "Cannot update an inactive employee",
      };
    }

    const updateData: any = {};
    if (data.firstName) updateData.first_name = data.firstName;
    if (data.surname) updateData.last_name = data.surname;
    if (data.gender) updateData.gender = data.gender;
    if (data.income) updateData.salary = data.income;
    if (data.dateOfBirth) updateData.date_of_birth = data.dateOfBirth;
    // IDType is editable per spec 5.6 — must be valid enum value (SA ID / Passport)
    if (data.idType) updateData.id_type = data.idType;
    // IDNumber conditional on idType = SA ID
    if (data.idNumber) updateData.id_number = data.idNumber;
    // PassportNumber conditional on idType = Passport
    if (data.passportNumber) updateData.passport_number = data.passportNumber;
    // EmploymentStatus is editable per spec 5.6
    if (data.employmentStatus) updateData.employment_status = data.employmentStatus;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    if (Object.keys(updateData).length === 0) {
      await t.rollback();
      return {
        success: false,
        message: "No valid fields provided for update. Please use camelCase (e.g., firstName).",
      };
    }

    await employeeRepo.update(leadId, employeeId, updateData, t);
    await t.commit();

    await AuditService.logEvent({
      eventType: AuditEventType.EMPLOYEE_IMPORT, 
      outcome: ActionOutcome.SUCCESS,
      userId: representativeId,
      metadata: { leadId, employeeId, updateData },
      ipAddress
    });

    return {
      success: true,
      message: "Employee updated successfully",
    };
  } catch (error: any) {
    if (t) await t.rollback();
    console.error("UPDATE EMPLOYEE SERVICE ERROR:", error);
    throw error;
  }
};

export const addSingleEmployeeService = async (
  leadId: string,
  employeeData: any,
  representativeId: string,
  ipAddress?: string
) => {
  const t = await sequelize.transaction();
  try {
    // 1. Verify Lead belongs to Representative
    const lead = await leadRepo.findOne({
      where: { lead_id: leadId, representative_id: representativeId },
      transaction: t
    });

    if (!lead) {
      await t.rollback();
      return {
        success: false,
        message: "Lead not found or access denied",
      };
    }

    // 2. Check for duplicate ID Number in this lead
    const existingEmployees = await employeeRepo.findByIdNumbers(leadId, t);
    const isDuplicate = existingEmployees.some((emp: any) => emp.id_number === employeeData.idNumber);

    if (isDuplicate) {
      await t.rollback();
      return {
        success: false,
        message: `Employee with ID Number ${employeeData.idNumber} already exists in this lead.`,
      };
    }

    // 3. Create Employee
    const newEmployee = {
      employee_id: uuidv4(),
      lead_id: leadId,
      first_name: employeeData.firstName,
      last_name: employeeData.surname,
      gender: employeeData.gender,
      salary: employeeData.income,
      date_of_birth: employeeData.dateOfBirth,
      id_type: employeeData.idType || IDType.SA_ID,
      id_number: employeeData.idNumber || null,
      passport_number: employeeData.passportNumber || null,
      employment_status: employeeData.employmentStatus || null,
      is_active: true,
    };

    await employeeRepo.create(newEmployee, t);
    await t.commit();

    await AuditService.logEvent({
      eventType: AuditEventType.EMPLOYEE_IMPORT,
      outcome: ActionOutcome.SUCCESS,
      userId: representativeId,
      metadata: { leadId, employeeId: newEmployee.employee_id, action: "add_single" },
      ipAddress
    });

    return {
      success: true,
      message: "Employee added successfully",
      employeeId: newEmployee.employee_id
    };
  } catch (error: any) {
    if (t) await t.rollback();
    console.error("ADD SINGLE EMPLOYEE SERVICE ERROR:", error);

    await AuditService.logEvent({
      eventType: AuditEventType.EMPLOYEE_IMPORT,
      outcome: ActionOutcome.FAILURE,
      userId: representativeId,
      metadata: { leadId, error: error.message },
      ipAddress
    });
    throw error;
  }
};

export const deleteEmployeeService = async (
  leadId: string,
  employeeId: string,
  representativeId: string,
  ipAddress?: string
) => {
  const t = await sequelize.transaction();
  try {
    const lead = await leadRepo.findOne({
      where: { lead_id: leadId, representative_id: representativeId },
      transaction: t
    });

    if (!lead) {
      await t.rollback();
      return {
        success: false,
        message: "Lead not found or access denied",
      };
    }
// 2. Verify Employee belongs to Lead
const employee = await employeeRepo.findByLeadAndId(leadId, employeeId, t);
if (!employee) {
  await t.rollback();
  return {
    success: false,
    message: "Employee not found in this lead",
  };
}

// 3. Check Minimum Employee Count (min 5)
const employeeCount = await employeeRepo.countByLeadId(leadId, t);
if (employeeCount <= 5) {
  await t.rollback();
  return {
    success: false,
    message: "Cannot delete employee. A minimum of 5 employees is required for this lead.",
  };
}

// 4. Delete related verification results first (to avoid FK conflict)
await employeeRepo.deleteVerificationResultsByEmployeeId(employeeId, t);

// 5. Delete Employee
await employeeRepo.delete(leadId, employeeId, t);
await t.commit();


    await AuditService.logEvent({
      eventType: AuditEventType.EMPLOYEE_IMPORT, 
      outcome: ActionOutcome.SUCCESS,
      userId: representativeId,
      metadata: { leadId, employeeId, action: "delete" },
      ipAddress
    });

    return {
      success: true,
      message: "Employee deleted successfully",
    };
  } catch (error: any) {
    if (t) await t.rollback();
    console.error("DELETE EMPLOYEE SERVICE ERROR:", error);
    throw error;
  }
};

