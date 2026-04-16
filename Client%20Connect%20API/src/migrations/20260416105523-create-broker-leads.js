"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_leads",
      {
        lead_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        lead_reference: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        lead_status: {
          type: Sequelize.ENUM(
            "Draft",
            "In Progress",
            "Quote Generated",
            "Awaiting Employer Acceptance",
            "Accepted",
            "Onboarding Submitted",
            "Pending Approval",
            "Approved",
            "Rejected",
            "Policy Created",
            "Expired",
            "Cancelled",
          ),
          allowNull: false,
        },
        representative_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        broker_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        lead_created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        lead_updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        cancelled_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        cancelled_by: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
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
      { tableName: "broker_leads", schema: "broker" },
      ["broker_id"],
    );
    await queryInterface.addIndex(
      { tableName: "broker_leads", schema: "broker" },
      ["lead_status"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_leads",
      schema: "broker",
    });
  },
};
