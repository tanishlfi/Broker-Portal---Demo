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
      { tableName: "onboardingPolicies", schema: "onboarding" },
      "allowDuplicate",
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      { tableName: "onboardingPolicies", schema: "onboarding" },
      "allowDuplicate",
    );
  },
};
