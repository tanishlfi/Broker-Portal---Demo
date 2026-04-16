"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class clientUpdateData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  clientUpdateData.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      idNumber: {
        type: DataTypes.STRING,
      },
      rolePlayerId: {
        type: DataTypes.INTEGER,
      },
      policyId: {
        type: DataTypes.INTEGER,
      },
      coverAmount: {
        type: DataTypes.FLOAT,
      },
      memberType: {
        type: DataTypes.INTEGER,
      },
      policyStatus: {
        type: DataTypes.INTEGER,
      },
      parentPolicyId: {
        type: DataTypes.INTEGER,
      },
      brokerId: {
        type: DataTypes.INTEGER,
      },
      representativeId: {
        type: DataTypes.INTEGER,
      },
      activeClaim: {
        type: DataTypes.BOOLEAN,
      },
      memberId: {
        type: DataTypes.INTEGER,
      },
      statedBenefitId: {
        type: DataTypes.INTEGER,
      },
      insuredLifeStatus: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "clientUpdateData",
      schema: "onboarding",
      tableName: "client_update_data",
    },
  );
  return clientUpdateData;
};
