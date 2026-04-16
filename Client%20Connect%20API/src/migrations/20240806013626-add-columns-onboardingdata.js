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
      { tableName: "onboardingData", schema: "onboarding" },
      "alsoMember",
      {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
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
      { tableName: "onboardingData", schema: "onboarding" },
      "alsoMember",
    );
  },
};
