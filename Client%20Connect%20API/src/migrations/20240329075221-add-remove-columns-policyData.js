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
      { tableName: "PolicyData", schema: "onboarding" },
      "ProductType",
      {
        type: DataTypes.STRING,
        defaultValue: "Scheme",
      },
    );

    await queryInterface.removeColumn(
      { tableName: "PolicyData", schema: "onboarding" },
      "productTypeId",
    );

    await queryInterface.addColumn(
      { tableName: "Files", schema: "onboarding" },
      "ProductType",
      {
        type: DataTypes.STRING,
        defaultValue: "Scheme",
      },
    );

    await queryInterface.removeColumn(
      { tableName: "Files", schema: "onboarding" },
      "productTypeId",
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
      { tableName: "PolicyData", schema: "onboarding" },
      "ProductType",
    );

    await queryInterface.removeColumn(
      { tableName: "Files", schema: "onboarding" },
      "ProductType",
    );
  },
};
