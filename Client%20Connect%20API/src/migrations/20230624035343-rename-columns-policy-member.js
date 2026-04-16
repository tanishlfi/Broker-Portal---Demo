"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "isStudent",
      "IsStudying",
    );
    await queryInterface.renameColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "isDisabled",
      "IsDisabled",
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "IsStudying",
      "isStudent",
    );

    await queryInterface.renameColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "IsDisabled",
      "isDisabled",
    );
  },
};
