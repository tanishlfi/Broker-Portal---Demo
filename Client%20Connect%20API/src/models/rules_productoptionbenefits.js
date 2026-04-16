"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductOptionBenefit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BenefitRule }) {
      // define association here
      this.belongsTo(BenefitRule, {
        foreignKey: "benefitId",
      });
    }
  }
  ProductOptionBenefit.init(
    {
      productOptionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      benefitId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        // references: {
        //   model: {
        //     tableName: "BenefitRules",
        //     schema: "rules",
        //     field: "benefitId",
        //   },
        //   key: "benefitId",
        // },
      },
    },
    {
      sequelize,
      schema: "rules",
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      modelName: "ProductOptionBenefit",
      tableName: "ProductOptionBenefits",
    },
  );
  return ProductOptionBenefit;
};
