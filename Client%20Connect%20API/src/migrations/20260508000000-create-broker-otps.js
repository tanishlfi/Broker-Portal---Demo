"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "broker_otps",
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
          comment: "UUID of the Lead or Quote this OTP belongs to",
        },
        reference_type: {
          type: Sequelize.ENUM("Lead", "Quote"),
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
          comment: "Counter for failed verification attempts",
        },
        is_blocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: "Flag set to true after 3 failed attempts",
        },
        last_attempt_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        sent_to: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: "Email address or Mobile number the OTP was sent to",
        },
        sent_method: {
          type: Sequelize.ENUM("Email", "SMS"),
          defaultValue: "Email",
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        schema: "broker",
      }
    );

    // Add indexes for performance
    await queryInterface.addIndex({ tableName: "broker_otps", schema: "broker" }, ["reference_id"]);
    await queryInterface.addIndex({ tableName: "broker_otps", schema: "broker" }, ["otp_code"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: "broker_otps", schema: "broker" });
  },
};
