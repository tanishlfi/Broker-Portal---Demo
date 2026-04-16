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
        { tableName: "AstuteResponses", schema: "vopd" },
        "groupNumber",
        {
          type: DataTypes.STRING,
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

    await queryInterface.removeColumn(
      { tableName: "AstuteResponses", schema: "vopd" },
      "groupNumber",
    );
  },
};
