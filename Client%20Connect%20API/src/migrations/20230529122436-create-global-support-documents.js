"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "SupportDocuments",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
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
        schema: "global",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "SupportDocuments",
      schema: "global",
    });
  },
};
