"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerVerificationResult extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
      this.belongsTo(models.BrokerEmployee, {
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
        type: DataTypes.JSON,
        allowNull: true,
      },
      aml_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aml_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      aml_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aml_timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      vopd_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verified_party_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "BrokerVerificationResult",
      schema: "broker",
      tableName: "bp_verification_results",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return BrokerVerificationResult;
};
