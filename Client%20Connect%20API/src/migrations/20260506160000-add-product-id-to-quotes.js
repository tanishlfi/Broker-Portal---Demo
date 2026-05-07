"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: "broker_quotes", schema: "broker" },
      "product_id",
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: {
            tableName: "broker_products",
            schema: "broker",
          },
          key: "product_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: "broker_quotes", schema: "broker" },
      "product_id"
    );
  },
};
