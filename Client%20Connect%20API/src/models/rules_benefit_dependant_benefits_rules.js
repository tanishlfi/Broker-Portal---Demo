"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BenefitDependantBenefitRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BenefitRule, DependantBenefitRule }) {
      // define association here
      this.belongsTo(BenefitRule, {
        foreignKey: "mainBenefitId",
      });

      this.belongsTo(DependantBenefitRule, {
        foreignKey: "dependantBenefitId",
      });
    }
  }
  BenefitDependantBenefitRule.init(
    {
      mainBenefitId: {
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: "BenefitRules",
            schema: "rules",
            field: "benefitId",
          },
          key: "benefitId",
        },
      },
      dependantBenefitId: {
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: "DependantBenefitRules",
            schema: "rules",
            field: "id",
          },
        },
      },
      default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      schema: "rules",
      modelName: "BenefitDependantBenefitRule",
      tableName: "BenefitDependantBenefitRules",
      timestamps: false,
      createdAt: false,
      updatedAt: false,
    },
  );
  return BenefitDependantBenefitRule;
};
