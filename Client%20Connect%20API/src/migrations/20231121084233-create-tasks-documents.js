"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "tasksDocuments",
      {
        id: {
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          type: DataTypes.UUID,
        },
        taskId: {
          type: DataTypes.UUID,
          required: true,
        },
        documentType: {
          type: DataTypes.STRING(255),
          required: true,
        },
        fileName: {
          type: DataTypes.STRING,
        },
        orgFileName: {
          type: DataTypes.STRING(1000),
        },
        createdBy: {
          type: DataTypes.STRING,
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
        schema: "app_data",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({
      tableName: "tasksDocuments",
      schema: "app_data",
    });
  },
};
