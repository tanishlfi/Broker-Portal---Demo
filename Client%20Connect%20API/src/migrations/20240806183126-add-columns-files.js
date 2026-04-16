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
      { tableName: "files", schema: "onboarding" },
      "documents",
      {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
    );

    await queryInterface.addColumn(
      { tableName: "files", schema: "onboarding" },
      "approverId",
      {
        type: DataTypes.TEXT,
        defaultValue: null,
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
      { tableName: "files", schema: "onboarding" },
      "documents",
    );

    await queryInterface.removeColumn(
      { tableName: "files", schema: "onboarding" },
      "approverId",
    );
  },
};
