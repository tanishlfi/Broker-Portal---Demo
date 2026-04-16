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
      { tableName: "Member", schema: "onboarding" },
      "onboardingDataId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { tableName: "onboardingData", schema: "onboarding" },
      "MemberId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { tableName: "PolicyMember", schema: "onboarding" },
      "onboardingDataId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { tableName: "onboardingData", schema: "onboarding" },
      "PolicyMemberId",
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
        { tableName: "Member", schema: "onboarding" },
        "onboardingDataId",
      );
    } catch (error) {
      console.log("Error removing column onboardingDataId: ", error);
    }

    try {
      await queryInterface.removeColumn(
        { tableName: "PolicyMember", schema: "onboarding" },
        "onboardingDataId",
      );
    } catch (error) {
      console.log("Error removing column onboardingDataId: ", error);
    }

    try {
      await queryInterface.removeColumn(
        { tableName: "onboardingData", schema: "onboarding" },
        "MemberId",
      );
    } catch (error) {
      console.log("Error removing column MemberId: ", error);
    }

    try {
      await queryInterface.removeColumn(
        { tableName: "onboardingData", schema: "onboarding" },
        "PolicyMemberId",
      );
    } catch (error) {
      console.log("Error removing column PolicyMemberId: ", error);
    }
  },
};
