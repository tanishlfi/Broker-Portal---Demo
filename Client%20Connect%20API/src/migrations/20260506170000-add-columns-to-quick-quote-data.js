"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      "province",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      "industry_type",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      "gender_split",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      "province"
    );
    await queryInterface.removeColumn(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      "industry_type"
    );
    await queryInterface.removeColumn(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      "gender_split"
    );
  },
};
