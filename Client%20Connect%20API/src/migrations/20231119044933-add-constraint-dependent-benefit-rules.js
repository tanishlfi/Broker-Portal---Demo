"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    // add contraint to dependent benefit rules set benefit allowNull to false
    await queryInterface.changeColumn(
      { schema: "rules", tableName: "DependantBenefitRules" },
      "benefit",
      {
        type: DataTypes.TEXT,
        allowNull: false,
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
    // remove constraint from dependent benefit rules set benefit allowNull to true
    await queryInterface.changeColumn(
      { schema: "rules", tableName: "DependantBenefitRules" },
      "benefit",
      {
        type: DataTypes.TEXT,
      },
    );
  },
};
