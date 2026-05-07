"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerLead extends Model {
    static associate(models) {
      this.hasOne(models.BrokerEmployer, {
        foreignKey: "lead_id",
        as: "employer",
      });
      this.hasOne(models.BrokerContact, {
        foreignKey: "lead_id",
        as: "contact",
      });
      this.hasMany(models.BrokerQuote, {
        foreignKey: "lead_id",
        as: "quotes",
      });
      this.hasMany(models.BrokerEmployee, {
        foreignKey: "lead_id",
        as: "employees",
      });
    }
  }

  BrokerLead.init(
    {
      lead_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lead_reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      lead_status: {
        type: DataTypes.ENUM(
          "Draft",
          "In Progress",
          "Quote Generated",
          "Awaiting Employer Acceptance",
          "Accepted",
          "Onboarding Submitted",
          "Pending Approval",
          "Approved",
          "Rejected",
          "Expired",
          "Cancelled",
        ),
        allowNull: false,
      },
      representative_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      broker_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      lead_created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      lead_updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelled_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "BrokerLead",
      schema: "broker",
      tableName: "broker_leads",
      timestamps: true,
    },
  );

  return BrokerLead;
};
