"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "ReferenceNumber",
      {
        type: DataTypes.STRING(50),
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
    await queryInterface.changeColumn(
      { schema: "onboarding", tableName: "PolicyData" },
      "ReferenceNumber",
      {
        type: DataTypes.STRING,
      },
    );
  },
};
