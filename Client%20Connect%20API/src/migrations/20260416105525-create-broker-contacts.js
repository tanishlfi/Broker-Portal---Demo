"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "bp_contacts",
      {
        contact_id: {
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
              tableName: "bp_leads",
              schema: "broker",
            },
            key: "lead_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        contact_first_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        contact_last_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        contact_email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        contact_mobile: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        preferred_communication_method: {
          type: Sequelize.ENUM("Email", "SMS", "Phone"),
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
      { tableName: "bp_contacts", schema: "broker" },
      ["lead_id"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "bp_contacts",
      schema: "broker",
    });
  },
};
