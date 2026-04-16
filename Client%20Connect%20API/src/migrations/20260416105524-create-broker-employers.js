"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_employers",
      {
        employer_id: {
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
        employer_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        registration_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        industry_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        number_of_employees: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        average_salary: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true,
        },
        province: {
          type: Sequelize.STRING,
          allowNull: false,
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
      { tableName: "broker_employers", schema: "broker" },
      ["lead_id"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_employers",
      schema: "broker",
    });
  },
};
