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
    // alter table onboarding.PolicyData change column to decimal(18,5)
    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "AdminPercentage",
      {
        type: DataTypes.DECIMAL(18, 5),
      },
    );

    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "CommissionPercentage",
      {
        type: DataTypes.DECIMAL(18, 5),
      },
    );

    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "BinderFeePercentage",
      {
        type: DataTypes.DECIMAL(18, 5),
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "PremiumAdjustmentPercentage",
      {
        type: DataTypes.DECIMAL(18, 5),
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
      { schema: "onboarding", tableName: "PolicyData" },
      "AdminPercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "CommissionPercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "BinderFeePercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "PremiumAdjustmentPercentage",
    );
  },
};
