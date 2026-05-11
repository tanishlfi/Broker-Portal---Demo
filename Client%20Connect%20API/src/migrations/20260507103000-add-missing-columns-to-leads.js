"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: "bp_leads", schema: "broker" },
      "last_saved_step",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      }
    );
    await queryInterface.addColumn(
      { tableName: "bp_leads", schema: "broker" },
      "cancel_reason",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: "bp_leads", schema: "broker" },
      "last_saved_step"
    );
    await queryInterface.removeColumn(
      { tableName: "bp_leads", schema: "broker" },
      "cancel_reason"
    );
  },
};
