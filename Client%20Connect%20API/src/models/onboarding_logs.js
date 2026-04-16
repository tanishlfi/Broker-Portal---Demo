"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class onboarding_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ onboardingPolicy }) {
      // define association here
      this.belongsTo(onboardingPolicy, {
        foreignKey: "policy_id",
      });
    }
  }
  onboarding_logs.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      policy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      member_changes: {
        type: DataTypes.STRING(4000),
        defaultValue: null,
        get: function () {
          const value = this.getDataValue("member_changes");
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue(
            "member_changes",
            value ? JSON.stringify(value) : null,
          );
        },
      },
      policy_changes: {
        type: DataTypes.STRING(4000),
        defaultValue: null,
        get: function () {
          const value = this.getDataValue("policy_changes");
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue(
            "policy_changes",
            value ? JSON.stringify(value) : null,
          );
        },
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "onboarding_logs",
      schema: "onboarding",
      tableName: "logs",
    },
  );
  return onboarding_logs;
};
