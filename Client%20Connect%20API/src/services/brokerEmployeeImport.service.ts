const { sequelize } = require("../models");
import { BrokerEmployeeRepository } from "../repositories/brokerEmployee.repository";
import { BrokerLeadRepository } from "../repositories/brokerLead.repository";
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

export const brokerImportEmployeesService = async (leadId: string, employees: any[]): Promise<BrokerImportResult> => {
  const t = await sequelize.transaction();

  try {
    // 1. Verify Lead Exists via Repository
    const lead = await leadRepo.findById(leadId, { transaction: t });
    if (!lead) {
      await t.rollback();
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
          id_number: emp.idNumber,
          id_type: "ID", 
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

    return {
      success: true,
      totalEmployees: employees.length,
      insertedEmployees: employeesToInsert.length,
      duplicateEmployees: duplicateCount,
    };
  } catch (error: any) {
    if (t) await t.rollback();
    console.error("BROKER IMPORT EMPLOYEES SERVICE ERROR:", error);
    throw error;
  }
};
