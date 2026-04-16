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
      { schema: "onboarding", tableName: "PolicyData" },
      "BrokerageName",
      {
        type: DataTypes.TEXT,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "ProviderName",
      {
        type: DataTypes.TEXT,
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
      { schema: "onboarding", tableName: "PolicyData" },
      "BrokerageName",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "ProviderName",
    );
  },
};
