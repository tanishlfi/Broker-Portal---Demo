"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "requests",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        ClientReference: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        requestType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        requestDescription: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        requestedBy: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        requestedDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        requestStatus: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        requestStatusNote: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        attachments: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        expiryDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        updatedBy: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        approverId: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        approvedAt: {
          allowNull: true,
          type: DataTypes.DATE,
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
        schema: "edit",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({ schema: "edit", tableName: "requests" });
  },
};
