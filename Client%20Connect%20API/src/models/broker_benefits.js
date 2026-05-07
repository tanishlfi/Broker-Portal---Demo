"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerBenefit extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerProduct, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  BrokerBenefit.init(
    {
      benefit_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      benefit_name: { type: DataTypes.STRING, allowNull: false },
      benefit_type: { type: DataTypes.ENUM("Life", "Funeral", "Accident", "VAPS"), allowNull: false },
      is_mandatory: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_embedded: { type: DataTypes.BOOLEAN, defaultValue: false },
      default_cover_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    },
    {
      sequelize,
      modelName: "BrokerBenefit",
      schema: "broker",
      tableName: "broker_benefits",
      timestamps: true,
    },
  );

  return BrokerBenefit;
};
