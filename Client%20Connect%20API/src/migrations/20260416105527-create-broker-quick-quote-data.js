"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_quick_quote_data",
      {
        quick_quote_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        quote_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: "broker_quotes",
              schema: "broker",
            },
            key: "quote_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        workforce_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        average_age: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        average_salary: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema: "broker",
      },
    );

    await queryInterface.addIndex(
      { tableName: "broker_quick_quote_data", schema: "broker" },
      ["quote_id"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_quick_quote_data",
      schema: "broker",
    });
  },
};
