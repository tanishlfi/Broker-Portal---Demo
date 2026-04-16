"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "policyNotes",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
        },
        policyId: {
          type: DataTypes.INTEGER,
        },
        note: {
          type: DataTypes.TEXT,
        },
        createdBy: {
          type: DataTypes.TEXT,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updateBy: {
          type: DataTypes.TEXT,
        },
      },
      {
        schema: "edit",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "edit",
      tableName: "policyNotes",
    });
  },
};
