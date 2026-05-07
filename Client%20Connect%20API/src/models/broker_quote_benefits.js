"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerQuoteBenefit extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerQuote, {
        foreignKey: "quote_id",
        as: "quote",
      });
    }
  }

  BrokerQuoteBenefit.init(
    {
      quote_benefit_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quote_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      benefit_type: { type: DataTypes.STRING, allowNull: false },
      benefit_name: { type: DataTypes.STRING, allowNull: false },
      cover_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
      premium_rate: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      premium_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
      is_vaps: { type: DataTypes.BOOLEAN, defaultValue: false },
      effective_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "BrokerQuoteBenefit",
      schema: "broker",
      tableName: "broker_quote_benefits",
      timestamps: true,
    },
  );

  return BrokerQuoteBenefit;
};
