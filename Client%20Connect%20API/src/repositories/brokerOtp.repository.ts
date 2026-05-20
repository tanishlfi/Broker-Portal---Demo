const { BrokerOTP } = require("../models");
const { Op } = require("sequelize");

export class BrokerOtpRepository {
  async findActiveOtp(referenceId: string, transaction?: any) {
    return await BrokerOTP.findOne({
      where: {
        reference_id: referenceId,
        is_verified: false,
        expires_at: { [Op.gt]: new Date() }
      },
      order: [["created_at", "DESC"]],
      transaction,
      lock: true 
    });
  }

  async create(data: any, transaction: any) {
    return await BrokerOTP.create(data, { transaction });
  }

  async updateMany(where: any, data: any, transaction: any) {
    return await BrokerOTP.update(data, { where, transaction });
  }

  async deleteMany(where: any, transaction: any) {
    return await BrokerOTP.destroy({ where, transaction });
  }
}
