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
      { tableName: "PolicyData", schema: "onboarding" },
      "onboardingPoliciesId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { tableName: "onboardingPolicies", schema: "onboarding" },
      "PolicyDataId",
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
    try {
      await queryInterface.removeColumn(
        { tableName: "PolicyData", schema: "onboarding" },
        "onboardingPoliciesId",
      );

      await queryInterface.removeColumn(
        { tableName: "onboardingPolicies", schema: "onboarding" },
        "PolicyDataId",
      );
    } catch (error) {
      console.log("Error removing column PolicyDataId: ", error);
    }
  },
};
