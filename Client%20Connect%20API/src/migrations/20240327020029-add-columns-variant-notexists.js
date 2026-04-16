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
    try {
      await queryInterface.addColumn(
        { schema: "app_data", tableName: "notifications" },
        "variant",
        {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: "app",
        },
      );
    } catch (error) {
      console.log("Column already exists");
    }
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
