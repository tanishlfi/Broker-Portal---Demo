"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "Files",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
        },
        productTypeId: {
          type: DataTypes.UUID,
          required: true,
        },
        providerId: {
          type: DataTypes.INTEGER,
          required: true,
        },
        productOptionId: {
          type: DataTypes.INTEGER,
        },
        brokerageId: {
          type: DataTypes.INTEGER,
        },
        providerInceptionDate: {
          type: DataTypes.DATE,
        },
        joinDate: {
          type: DataTypes.DATEONLY,
          required: true,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "pending",
        },
        statusDescription: {
          type: DataTypes.STRING,
          defaultValue: "New file uploaded",
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
        schema: "onboarding",
        paranoid: true,
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "Files",
      schema: "onboarding",
    });
  },
};
