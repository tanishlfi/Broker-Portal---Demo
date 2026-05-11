"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      { tableName: "bp_verification_results", schema: "broker" },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        lead_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: "bp_leads", schema: "broker" },
            key: "lead_id",
          },
        },
        employee_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: { tableName: "bp_employees", schema: "broker" },
            key: "employee_id",
          },
        },
        vopd_status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        vopd_response: {
          type: Sequelize.TEXT, // Using TEXT for MSSQL to store JSON
          allowNull: true,
        },
        aml_status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        aml_response: {
          type: Sequelize.TEXT, // Using TEXT for MSSQL to store JSON
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("GETDATE"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("GETDATE"),
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: "bp_verification_results", schema: "broker" });
  },
};
