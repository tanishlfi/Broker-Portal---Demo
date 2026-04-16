"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "notes",
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "notes",
      {
        type: DataTypes.STRING(4000),
      },
    );
  },
};
