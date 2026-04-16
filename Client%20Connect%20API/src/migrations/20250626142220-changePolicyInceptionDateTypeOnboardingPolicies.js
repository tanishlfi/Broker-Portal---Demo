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
      { schema: "onboarding", tableName: "onboardingPolicies" },
      "PolicyInceptionDate",
      {
        type: DataTypes.DATEONLY,
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
      { schema: "onboarding", tableName: "onboardingPolicies" },
      "PolicyInceptionDate",
      {
        type: DataTypes.DATE,
      },
    );
  },
};
