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
    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "InstallmentPremium",
      {
        type: DataTypes.DECIMAL(18, 6),
      },
    );

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "AdminPercentage",
      {
        type: DataTypes.DECIMAL(18, 6),
      },
    );

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "CommissionPercentage",
      {
        type: DataTypes.DECIMAL(18, 6),
      },
    );

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "BinderFeePercentage",
      {
        type: DataTypes.DECIMAL(18, 6),
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

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "InstallmentPremium",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "AdminPercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "CommissionPercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.changeColumn(
      { schema: "edit", tableName: "policyData" },
      "BinderFeePercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );
  },
};
