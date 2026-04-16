"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "SchemeBankingDetails",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        scheme_id: {
          type: DataTypes.UUID,
        },
        AccountNumber: {
          type: DataTypes.STRING,
        },
        BankName: {
          type: DataTypes.STRING,
        },
        BankBranchId: {
          type: DataTypes.INTEGER,
        },
        BankAccountType: {
          type: DataTypes.STRING,
        },
        AccountHolderName: {
          type: DataTypes.STRING,
        },
        BranchCode: {
          type: DataTypes.STRING,
        },
        idNumber: {
          type: DataTypes.STRING(30),
        },
        AccountHolderInitials: {
          type: DataTypes.STRING,
        },
        AccountHolderSurname: {
          type: DataTypes.STRING,
        },
        hyphen_verification: {
          type: DataTypes.STRING(4000),
        },
        status: {
          type: DataTypes.STRING(4000),
          validate: {
            isIn: [["pending", "success", "failed"]],
          },
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
        schema: "schemes",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "schemes",
      tableName: "SchemeBankingDetails",
    });
  },
};
