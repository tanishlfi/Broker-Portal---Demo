const { BrokerLead, BrokerEmployer, BrokerContact, BrokerHistory } = require("../models");

export class BrokerLeadRepository {
  async findById(leadId: string, options: any = {}) {
    return await BrokerLead.findByPk(leadId, options);
  }

  async findOne(options: any = {}) {
    return await BrokerLead.findOne(options);
  }

  async create(data: any, transaction: any) {
    return await BrokerLead.create(data, { transaction });
  }

  async update(leadId: string, data: any, transaction: any) {
    return await BrokerLead.update(data, {
      where: { lead_id: leadId },
      transaction
    });
  }

  async findAndCountAll(options: any = {}) {
    return await BrokerLead.findAndCountAll(options);
  }

  async createEmployer(data: any, transaction: any) {
    return await BrokerEmployer.create(data, { transaction });
  }

  async updateEmployer(leadId: string, data: any, transaction: any) {
    return await BrokerEmployer.update(data, {
      where: { lead_id: leadId },
      transaction
    });
  }

  async createContact(data: any, transaction: any) {
    return await BrokerContact.create(data, { transaction });
  }

  async updateContact(leadId: string, data: any, transaction: any) {
    return await BrokerContact.update(data, {
      where: { lead_id: leadId },
      transaction
    });
  }

  async logHistory(data: any, transaction: any) {
    return await BrokerHistory.create(data, { transaction });
  }

  async findHistoryByLeadId(leadId: string) {
    return await BrokerHistory.findAll({
      where: {
        table_name: "BrokerLead",
        record_id: leadId
      },
      order: [["created_at", "DESC"]]
    });
  }
}
