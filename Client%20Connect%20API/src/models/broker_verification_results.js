"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerVerificationResult extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
      this.belongsTo(models.BrokerQuoteEmployee, {
        foreignKey: "employee_id",
        as: "employee",
      });
    }
  }

  BrokerVerificationResult.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      vopd_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vopd_response: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      aml_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aml_response: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "BrokerVerificationResult",
      schema: "broker",
      tableName: "broker_verification_results",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return BrokerVerificationResult;
};
