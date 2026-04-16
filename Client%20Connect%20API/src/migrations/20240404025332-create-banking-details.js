"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "BankingDetails",
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
        schema: "onboarding",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "onboarding",
      tableName: "BankingDetails",
    });
  },
};
