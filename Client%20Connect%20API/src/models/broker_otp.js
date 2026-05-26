"use strict";
const { Model } = require("sequelize");
const { REFERENCE_TYPE_OPTIONS, SENT_METHOD, OTP_STATUS_OPTIONS } = require("../enums/brokerPortalEnums");

module.exports = (sequelize, DataTypes) => {
  class BrokerOTP extends Model {
    static associate(models) {
      // define association here
    }
  }

  BrokerOTP.init(
    {
      otp_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      otp_expiry: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      otp_status: {
        type: DataTypes.ENUM(...OTP_STATUS_OPTIONS),
        defaultValue: "Generated",
      },
      sent_to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sent_method: {
        type: DataTypes.ENUM(...SENT_METHOD),
        defaultValue: "Email",
      },
    },
    {
      sequelize,
      modelName: "BrokerOTP",
      schema: "broker",
      tableName: "bp_otps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return BrokerOTP;
};
