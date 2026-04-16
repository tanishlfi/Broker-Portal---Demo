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
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurer",
      {
        type: DataTypes.STRING,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurerPolicyNumber",
      {
        type: DataTypes.STRING(50),
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurerJoinDate",
      {
        type: DataTypes.DATEONLY,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurerCancellationDate",
      {
        type: DataTypes.DATEONLY,
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
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurer",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurerPolicyNumber",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurerJoinDate",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "PolicyMember" },
      "PreviousInsurerCancellationDate",
    );
  },
};
