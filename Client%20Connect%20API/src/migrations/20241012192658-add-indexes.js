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
    await queryInterface.addIndex(
      { tableName: "onboardingPolicies", schema: "onboarding" },
      ["fileId"],
      { name: "idx_onboardingPolicies_fileId", unique: false },
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.removeIndex(
    //   { tableName: "onboardingPolicies", schema: "onboarding" },
    //   "idx_onboardingPolicies_fileId",
    // );
  },
};
