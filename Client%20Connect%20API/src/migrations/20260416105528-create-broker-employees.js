"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "broker_employees",
      {
        employee_id: {
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
        first_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        date_of_birth: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        id_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        salary: {
          type: Sequelize.DECIMAL(18, 2),
          allowNull: true,
        },
        gender: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
      { tableName: "broker_employees", schema: "broker" },
      ["lead_id"],
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({
      tableName: "broker_employees",
      schema: "broker",
    });
  },
};
