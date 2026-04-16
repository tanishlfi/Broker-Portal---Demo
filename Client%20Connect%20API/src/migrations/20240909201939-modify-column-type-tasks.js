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
    // alter body column datatype to text in  schema: "app_data",tableName: "tasks",

    await queryInterface.changeColumn(
      { tableName: "tasks", schema: "app_data" },
      "body",
      {
        type: DataTypes.TEXT,
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
  },
};
