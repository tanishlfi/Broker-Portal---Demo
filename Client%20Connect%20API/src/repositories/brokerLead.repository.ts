const { BrokerLead, BrokerEmployer, BrokerContact, BrokerHistory, sequelize } = require("../models");

export class BrokerLeadRepository {
  async findById(leadId: string, options: any = {}) {
    return await BrokerLead.findByPk(leadId, options);
  }

  async findOne(options: any = {}) {
    return await BrokerLead.findOne(options);
  }

  async findAll(options: any = {}) {
    return await BrokerLead.findAll(options);
  }

  async count(options: any = {}) {
    return await BrokerLead.count(options);
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

  async getLeadCountsByStatus(representativeId: string) {
    return await BrokerLead.findAll({
      where: { 
        representative_id: representativeId
      },
      attributes: [
        "lead_status",
        [sequelize.fn("COUNT", sequelize.col("lead_id")), "count"]
      ],
      group: ["lead_status"],
      raw: true
    });
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
}
