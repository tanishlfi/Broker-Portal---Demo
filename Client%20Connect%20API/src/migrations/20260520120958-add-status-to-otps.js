"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: "bp_otps", schema: "broker" },
      "status",
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "Generated",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn({ tableName: "bp_otps", schema: "broker" }, "status");
  },
};
