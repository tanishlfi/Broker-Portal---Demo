"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerQuickQuoteData extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerQuote, {
        foreignKey: "quote_id",
        as: "quote",
      });
    }
  }

  BrokerQuickQuoteData.init(
    {
      quick_quote_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quote_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      workforce_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      average_age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      average_salary: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BrokerQuickQuoteData",
      schema: "broker",
      tableName: "broker_quick_quote_data",
      timestamps: true,
      updatedAt: false, // Since updated_at wasn't in the schema for this table
    },
  );

  return BrokerQuickQuoteData;
};
