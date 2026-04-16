"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "parentPolicyId",
      {
        type: DataTypes.INTEGER,
        required: true,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "SchemeRolePlayerId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "AdminPercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "CommissionPercentage",
      {
        type: DataTypes.DECIMAL,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "BinderFeePercentage",
      {
        type: DataTypes.DECIMAL,
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
      { schema: "onboarding", tableName: "Files" },
      "parentPolicyId",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "Files" },
      "SchemeRolePlayerId",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "Files" },
      "AdminPercentage",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "Files" },
      "CommissionPercentage",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "Files" },
      "BinderFeePercentage",
    );
  },
};
