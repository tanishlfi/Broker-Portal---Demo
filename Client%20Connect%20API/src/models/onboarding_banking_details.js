"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BankingDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Member }) {
      // define association here
      this.belongsTo(Member, {
        foreignKey: "MemberId",
      });
    }
  }
  BankingDetail.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      MemberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      AccountNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      Bank: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      BranchCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      AccountType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      DebitOrderDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BankingDetail",
      schema: "onboarding",
      tableName: "BankingDetails",
    },
  );
  return BankingDetail;
};
