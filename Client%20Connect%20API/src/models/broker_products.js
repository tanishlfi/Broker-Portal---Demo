"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerProduct extends Model {
    static associate(models) {
      this.hasMany(models.BrokerBenefit, {
        foreignKey: "product_id",
        as: "benefits",
      });
    }
  }

  BrokerProduct.init(
    {
      product_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      product_name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "BrokerProduct",
      schema: "broker",
      tableName: "broker_products",
      timestamps: true,
    },
  );

  return BrokerProduct;
};
