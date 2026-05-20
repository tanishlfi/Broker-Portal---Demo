const { BrokerEmployee } = require("../models");

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
}
