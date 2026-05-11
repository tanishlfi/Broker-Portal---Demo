"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      { tableName: "bp_otps", schema: "broker" },
      {
        otp_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        reference_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        reference_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        otp_code: {
          type: Sequelize.STRING(6),
          allowNull: false,
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        is_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        attempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        is_blocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        last_attempt_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        sent_to: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sent_method: {
          type: Sequelize.STRING,
          defaultValue: "Email",
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      }
    );

    // Add indexes
    await queryInterface.addIndex(
      { tableName: "bp_otps", schema: "broker" },
      ["reference_id"]
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: "bp_otps", schema: "broker" });
  },
};
