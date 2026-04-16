"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class productOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ benefit }) {
      // define association here
      this.belongsTo(benefit, {
        foreignKey: "benefitId",
      });
    }
  }
  productOption.init(
    {
      productOptionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      benefitId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "productOption",
      schema: "rules",
      tableName: "productOptions",
    },
  );
  return productOption;
};
