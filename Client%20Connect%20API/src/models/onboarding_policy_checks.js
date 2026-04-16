"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PolicyCheck extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Policy, onboardingPolicy }) {
      // define association here
      this.belongsTo(Policy, {
        foreignKey: "policyId",
        as: "checksEdits",
      });
      this.belongsTo(onboardingPolicy, {
        foreignKey: "policyId",
        as: "checks",
      });
    }
  }
  PolicyCheck.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      policyId: {
        type: DataTypes.INTEGER,
      },
      checkDescr: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      modelName: "PolicyCheck",
      schema: "onboarding",
      tableName: "policy_checks",
    },
  );
  return PolicyCheck;
};
