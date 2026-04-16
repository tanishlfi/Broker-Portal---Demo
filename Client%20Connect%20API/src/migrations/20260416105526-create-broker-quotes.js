"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_quotes",
      {
        quote_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        lead_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: "broker_leads",
              schema: "broker",
            },
            key: "lead_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        quote_reference: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        quote_type: {
          type: Sequelize.ENUM("Quick", "Full"),
          allowNull: true,
        },
        quote_status: {
          type: Sequelize.ENUM(
            "Draft",
            "Generated",
            "Revised",
            "Awaiting Employer Acceptance",
            "Accepted",
            "Expired",
            "Rejected",
          ),
          allowNull: true,
        },
        quote_version: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false,
        },
        total_premium: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true,
        },
        premium_frequency: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        pricing_reference: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        quote_generated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        quote_expiry_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        employer_accepted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        employer_accepted_by_otp: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
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
      { tableName: "broker_quotes", schema: "broker" },
      ["lead_id"],
    );
    await queryInterface.addIndex(
      { tableName: "broker_quotes", schema: "broker" },
      ["quote_status"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_quotes",
      schema: "broker",
    });
  },
};
