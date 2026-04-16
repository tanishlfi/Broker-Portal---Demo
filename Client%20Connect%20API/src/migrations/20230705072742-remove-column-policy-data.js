"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "brokerageId",
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
      "brokerageId",
      {
        type: DataTypes.INTEGER,
      },
    );
  },
};
