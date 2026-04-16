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
      { schema: "onboarding", tableName: "Files" },
      "totalRows",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "blankRows",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "Files" },
      "processedRows",
      {
        type: DataTypes.INTEGER,
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
      { schema: "onboarding", tableName: "Files" },
      "totalRows",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "Files" },
      "blankRows",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "Files" },
      "processedRows",
    );
  },
};
