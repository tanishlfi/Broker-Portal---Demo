"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DependantBenefitRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BenefitRule, BenefitDependantBenefitRule }) {
      // define association here

      this.belongsToMany(BenefitRule, {
        foreignKey: "dependantBenefitId",
        through: BenefitDependantBenefitRule,
      });
    }
  }
  DependantBenefitRule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      benefit: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Dependant benefit name is required.",
          },
        },
      },
      maxAge: {
        type: DataTypes.INTEGER,
      },
      minAge: {
        type: DataTypes.INTEGER,
      },
      benefitAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      coverMemberType: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          isIn: {
            args: [["Extended Family", "Spouse", "Child"]],
            msg: "Cover member type must be either Extended Family, Spouse or Child.",
          },
        },
      },
      subGroup: {
        type: DataTypes.STRING,
        validate: {
          isIn: {
            args: [["Other", "Parent", "Student", "Disabled"]],
            msg: "Sub group must be either Spouse or Child.",
          },
        },
      },
      baseRate: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      schema: "rules",
      tableName: "DependantBenefitRules",
      modelName: "DependantBenefitRule",
    },
  );
  return DependantBenefitRule;
};
