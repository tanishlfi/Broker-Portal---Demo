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
      { tableName: "PolicyMember", schema: "onboarding" },
      "PolicyMemberStatusId",
      {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    );
    await queryInterface.addColumn(
      { tableName: "PolicyMember", schema: "onboarding" },
      "ExistingMember",
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      { tableName: "PolicyMember", schema: "onboarding" },
      "PolicyMemberStatusId",
    );
    await queryInterface.removeColumn(
      { tableName: "PolicyMember", schema: "onboarding" },
      "ExistingMember",
    );
  },
};
