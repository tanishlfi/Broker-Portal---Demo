"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PolicyDocuments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Policy }) {
      this.belongsTo(Policy, {
        foreignKey: "policyId",
      });

      // define association here
    }
  }
  PolicyDocuments.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      policyId: {
        type: DataTypes.INTEGER,
        required: true,
      },
      documentType: {
        type: DataTypes.STRING(255),
        required: true,
      },
      fileName: {
        type: DataTypes.STRING,
      },
      orgFileName: {
        type: DataTypes.STRING(1000),
      },
      createdBy: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "PolicyDocuments",
      tableName: "PolicyDocuments",
      schema: "onboarding",
    },
  );
  return PolicyDocuments;
};
