const { BrokerQuote, BrokerLead, BrokerContact, BrokerEmployer, BrokerQuickQuoteData, BrokerQuoteBenefit, BrokerQuoteOnboardingDetail } = require("../models");

export class BrokerQuoteRepository {
  async findById(quoteId: string, options: any = {}) {
    return await BrokerQuote.findByPk(quoteId, options);
  }

  async findOne(options: any = {}) {
    return await BrokerQuote.findOne(options);
  }

  async create(data: any, transaction: any) {
    return await BrokerQuote.create(data, { transaction });
  }

  async update(quoteId: string, data: any, transaction?: any) {
    return await BrokerQuote.update(data, {
      where: { quote_id: quoteId },
      transaction
    });
  }

  async findAndCountAll(options: any = {}) {
    return await BrokerQuote.findAndCountAll(options);
  }

  async findOrCreateOnboardingDetail(quoteId: string, defaults: any, transaction: any) {
    return await BrokerQuoteOnboardingDetail.findOrCreate({
      where: { quote_id: quoteId },
      defaults,
      transaction,
    });
  }
}
