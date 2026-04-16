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
      "PolicyDetailsOrg",
      {
        type: DataTypes.TEXT,
      },
    );

    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "paymentMethodId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "regularInstallmentDayOfMonth",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "decemberInstallmentDayOfMonth",
      {
        type: DataTypes.INTEGER,
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
      "PolicyDetailsOrg",
    );

    await queryInterface.removeColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "paymentMethodId",
    );

    await queryInterface.removeColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "regularInstallmentDayOfMonth",
    );

    await queryInterface.removeColumn(
      {
        schema: "edit",
        tableName: "policyData",
      },
      "decemberInstallmentDayOfMonth",
    );
  },
};
