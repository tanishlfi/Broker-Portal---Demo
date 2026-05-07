"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_quote_benefits",
      {
        quote_benefit_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
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
        benefit_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        benefit_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        cover_amount: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
        },
        premium_rate: {
          type: Sequelize.DECIMAL(18, 4),
          allowNull: false,
        },
        premium_amount: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: false,
        },
        is_vaps: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        effective_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: true,
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
      { tableName: "broker_quote_benefits", schema: "broker" },
      ["quote_id"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_quote_benefits",
      schema: "broker",
    });
  },
};
