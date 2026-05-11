"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerQuote extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
      this.hasOne(models.BrokerQuickQuoteData, {
        foreignKey: "quote_id",
        as: "quick_quote_data",
      });
      this.hasMany(models.BrokerQuoteBenefit, {
        foreignKey: "quote_id",
        as: "benefits",
      });
      this.belongsTo(models.BrokerProduct, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  BrokerQuote.init(
    {
      quote_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      quote_reference: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      quote_type: {
        type: DataTypes.ENUM("Quick", "Full"),
        allowNull: true,
      },
      quote_status: {
        type: DataTypes.ENUM(
          "Draft",
          "Generated",
          "Revised",
          "Awaiting Employer Acceptance",
          "Accepted",
          "Expired",
          "Rejected",
        ),
        allowNull: true,
      },
      quote_version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      total_premium: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      premium_frequency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pricing_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quote_generated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      quote_expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      employer_accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      employer_accepted_by_otp: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      rma_member_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_permanent_employees: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      is_actively_at_work: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      is_replacing_policy: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      replaced_policy_includes_disability: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      is_policy_older_than_6_months: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      replaced_policy_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      province: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BrokerQuote",
      schema: "broker",
      tableName: "bp_quotes",
      timestamps: true,
    },
  );

  return BrokerQuote;
};
