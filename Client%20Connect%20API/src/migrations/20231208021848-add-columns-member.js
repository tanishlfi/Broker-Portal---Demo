"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Data`TypeDataTypes.INTEGER });
     */
    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Member" },
      "notes",
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
      { schema: "onboarding", tableName: "Member" },
      "notes",
    );
  },
};
