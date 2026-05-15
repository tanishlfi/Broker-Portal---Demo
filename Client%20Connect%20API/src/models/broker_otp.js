"use strict";
const { Model } = require("sequelize");
const { REFERENCE_TYPE_OPTIONS , SENT_METHOD} = require("../enums/brokerPortalEnums");

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
      reference_type: {
        type: DataTypes.ENUM(...REFERENCE_TYPE_OPTIONS),
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      last_attempt_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
