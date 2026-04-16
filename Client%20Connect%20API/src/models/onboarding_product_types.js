"use strict";
const { Model } = require("sequelize");
// const files = require('./files');
module.exports = (sequelize, DataTypes) => {
  class ProductType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate({ File, Policy }) {
    //   // define association here
    //   this.hasMany(File, {
    //     foreignKey: "productTypeId",
    //   });
    //   this.hasMany(Policy, {
    //     foreignKey: "productTypeId",
    //   });
    // }
  }
  ProductType.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      defaultProductOptionId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      schema: "onboarding",
      modelName: "ProductType",
      tableName: "ProductTypes",
    },
  );
  return ProductType;
};
