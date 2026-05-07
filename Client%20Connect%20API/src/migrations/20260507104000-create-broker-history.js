"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_history",
      {
        history_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        table_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        record_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        change_type: {
          type: Sequelize.ENUM("CREATE", "UPDATE", "DELETE"),
          allowNull: false,
        },
        before_value: {
          type: Sequelize.TEXT, // Using TEXT for compatibility with MSSQL as JSONB substitute
          allowNull: true,
        },
        after_value: {
          type: Sequelize.TEXT, // Using TEXT for compatibility with MSSQL as JSONB substitute
          allowNull: true,
        },
        changed_by: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        ip_address: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        schema: "broker",
      }
    );

    await queryInterface.addIndex(
      { tableName: "broker_history", schema: "broker" },
      ["record_id"]
    );
    await queryInterface.addIndex(
      { tableName: "broker_history", schema: "broker" },
      ["table_name"]
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_history",
      schema: "broker",
    });
  },
};
