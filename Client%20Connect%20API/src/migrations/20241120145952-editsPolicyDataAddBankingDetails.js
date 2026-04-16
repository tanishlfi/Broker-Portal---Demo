"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "BankingDetails",
      {
        type: DataTypes.TEXT,
      },
    );
    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "BankingDetailsOrg",
      {
        type: DataTypes.TEXT,
      },
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "BankingDetails",
    );

    await queryInterface.removeColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "BankingDetailsOrg",
    );
  },
};
