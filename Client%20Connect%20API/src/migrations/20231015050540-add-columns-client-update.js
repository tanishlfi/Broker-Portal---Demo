"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "client_updates" },
      "batchSentAt",
      {
        type: DataTypes.DATE,
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
      { schema: "onboarding", tableName: "client_updates" },
      "batchSentAt",
    );
  },
};
