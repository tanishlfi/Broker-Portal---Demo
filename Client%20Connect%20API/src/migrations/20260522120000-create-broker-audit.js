"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "bp_audit",
      {
        audit_record_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        audit_event_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        action_outcome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        action_date_time: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        user_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        metadata: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      },
      {
        schema: "broker",
      },
    );

    // Add indexes for faster searching
    await queryInterface.addIndex(
      { tableName: "bp_audit", schema: "broker" },
      ["audit_event_type"],
    );
    await queryInterface.addIndex(
      { tableName: "bp_audit", schema: "broker" },
      ["user_id"],
    );
    await queryInterface.addIndex(
      { tableName: "bp_audit", schema: "broker" },
      ["action_date_time"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "bp_audit",
      schema: "broker",
    });
    
    // Remove the enums if needed (Sequelize usually handles this, but some DBs require manual removal)
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "broker"."enum_bp_audit_audit_event_type";');
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "broker"."enum_bp_audit_action_outcome";');
  },
};
