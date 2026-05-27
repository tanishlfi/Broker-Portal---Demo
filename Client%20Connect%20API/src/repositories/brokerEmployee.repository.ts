const { BrokerEmployee, BrokerVerificationResult } = require("../models");

export class BrokerEmployeeRepository {
  async findByIdNumbers(leadId: string, transaction?: any) {
    return await BrokerEmployee.findAll({
      where: { lead_id: leadId },
      attributes: ["id_number"],
      transaction
    });
  }

  async bulkCreate(employees: any[], transaction: any) {
    return await BrokerEmployee.bulkCreate(employees, { transaction });
  }

  async findByLeadId(leadId: string, transaction?: any) {
    return await BrokerEmployee.findAll({
      where: { lead_id: leadId },
      transaction
    });
  }

  async countByLeadId(leadId: string, transaction?: any) {
    return await BrokerEmployee.count({
      where: { lead_id: leadId },
      transaction
    });
  }

  async findById(employeeId: string, transaction?: any) {
    return await BrokerEmployee.findByPk(employeeId, { transaction });
  }

  async findByLeadAndId(leadId: string, employeeId: string, transaction?: any) {
    return await BrokerEmployee.findOne({
      where: { lead_id: leadId, employee_id: employeeId },
      transaction
    });
  }

  async update(leadId: string, employeeId: string, data: any, transaction?: any) {
    return await BrokerEmployee.update(data, {
      where: { lead_id: leadId, employee_id: employeeId },
      transaction,
      returning: true
    });
  }

  async create(employee: any, transaction?: any) {
    return await BrokerEmployee.create(employee, { transaction });
  }

  async deleteVerificationResultsByEmployeeId(employeeId: string, transaction?: any) {
    return await BrokerVerificationResult.destroy({
      where: { employee_id: employeeId },
      transaction
    });
  }

  async delete(leadId: string, employeeId: string, transaction?: any) {
    return await BrokerEmployee.destroy({
      where: { lead_id: leadId, employee_id: employeeId },
      transaction
    });
  }
}
