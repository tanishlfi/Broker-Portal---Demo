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
      { schema: "app_data", tableName: "users" },
      "user_metadata",
      {
        type: DataTypes.STRING(4000),
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
      { schema: "app_data", tableName: "users" },
      "user_metadata",
    );
  },
};
