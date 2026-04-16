"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class clientUpdate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Policy }) {
      // define association here
      this.belongsTo(Policy, { foreignKey: "policyId" });
    }
  }
  clientUpdate.init(
    {
      idNumber: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      idTypeId: {
        type: DataTypes.INTEGER,
      },
      batchId: {
        type: DataTypes.INTEGER,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      surname: {
        type: DataTypes.STRING,
      },
      numberOfPoliciesFound: {
        type: DataTypes.INTEGER,
      },
      policyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      batchSentAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "clientUpdate",
      schema: "onboarding",
      tableName: "client_update",
    },
  );
  return clientUpdate;
};
