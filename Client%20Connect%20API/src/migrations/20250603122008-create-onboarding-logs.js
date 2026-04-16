"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "logs",
      {
        id: {
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          type: DataTypes.UUID,
        },
        policy_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        member_changes: {
          type: DataTypes.STRING(4000),
          defaultValue: null,
        },
        policy_changes: {
          type: DataTypes.STRING(4000),
          defaultValue: null,
        },
        user: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
      },
      {
        schema: "onboarding",
        tableName: "logs",
      },
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      tableName: "logs",
      schema: "onboarding",
    });
  },
};
