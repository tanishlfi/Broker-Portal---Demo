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
    // drop the existing column requestType in edit.requests
    try {
      await queryInterface.removeColumn(
        {
          schema: "edit",
          tableName: "requests",
        },
        "requestType",
      );
    } catch (error) {
      console.log("Column already deleted");
    }

    // alter column requestType in edit.requests to string[] type
    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "requests",
      },
      "requestType",
      {
        type: DataTypes.TEXT,
        allowNull: true,
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
    // revert column requestType in edit.requests to string type
    try {
      await queryInterface.removeColumn(
        {
          schema: "edit",
          tableName: "requests",
        },
        "requestType",
      );
    } catch (error) {
      console.log("Column already deleted");
    }
    // add the existing column requestType in edit.requests
    await queryInterface.addColumn(
      {
        schema: "edit",
        tableName: "requests",
      },
      "requestType",
      {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Edit",
      },
    );
  },
};
