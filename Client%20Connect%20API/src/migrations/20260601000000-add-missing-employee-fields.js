"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: "bp_employees", schema: "broker" },
      "passport_number",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      { tableName: "bp_employees", schema: "broker" },
      "employment_status",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: "bp_employees", schema: "broker" },
      "passport_number"
    );
    await queryInterface.removeColumn(
      { tableName: "bp_employees", schema: "broker" },
      "employment_status"
    );
  },
};
