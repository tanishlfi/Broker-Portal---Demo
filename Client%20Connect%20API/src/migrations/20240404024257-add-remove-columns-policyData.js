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
      "AffordabilityStatus",
      {
        type: DataTypes.STRING,
      },
    );
    // Add the following columns to the PolicyData table:
    // - AnnualIncreaseOption
    // - IncreaseMonth
    await queryInterface.addColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "AnnualIncreaseOption",
      {
        type: DataTypes.STRING,
      },
    );

    await queryInterface.addColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "IncreaseMonth",
      {
        type: DataTypes.STRING,
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
      "AffordabilityStatus",
    );

    await queryInterface.removeColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "AnnualIncreaseOption",
    );

    await queryInterface.removeColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "IncreaseMonth",
    );
  },
};
