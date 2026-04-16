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
      "StatusId",
      {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    );

    await queryInterface.addColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "CancelReasonId",
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
      { tableName: "PolicyData", schema: "onboarding" },
      "StatusId",
    );

    await queryInterface.removeColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "CancelReasonId",
    );
  },
};
