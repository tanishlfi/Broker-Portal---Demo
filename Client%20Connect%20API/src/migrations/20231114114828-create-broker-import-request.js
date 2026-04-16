"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "brokerImportRequests",
      {
        brokerImportRequestId: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        brokerageId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: "Brokerage",
              schema: "broker",
              model: "Brokerage",
              key: "id",
            },
          },
        },
        FSPNumber: {
          type: DataTypes.STRING(50),
        },
        representativeIdNumbers: {
          type: DataTypes.TEXT, // Using TEXT for varchar(max). In SQL Server, it maps to NVARCHAR(MAX).
        },
        requestDate: {
          type: DataTypes.DATE,
        },
        responseDate: {
          type: DataTypes.DATE,
        },
        requestUserReference: {
          type: DataTypes.STRING(30),
        },
        responseMessage: {
          type: DataTypes.TEXT, // Using TEXT for varchar(max). In SQL Server, it maps to NVARCHAR(MAX).
        },
        image: {
          type: DataTypes.TEXT, // Assuming image data is stored in text format. In SQL Server, it maps to NVARCHAR(MAX).
        },
        _info: {
          type: DataTypes.STRING(4000),
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
        schema: "broker",
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable({
      tableName: "brokerImportRequests",
      schema: "broker",
    });
  },
};
