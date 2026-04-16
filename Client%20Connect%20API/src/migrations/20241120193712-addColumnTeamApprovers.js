"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "BankingDetails",
      {
        type: DataTypes.TEXT,
      },
    );
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.addColumn(
      {
        schema: "app_data",
        tableName: "approvers",
      },
      "Team",
      {
        type: DataTypes.STRING,
      },
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * await queryInterface.removeColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "BankingDetails",
    );
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      {
        schema: "app_data",
        tableName: "approvers",
      },
      "Team",
    );
  },
};
