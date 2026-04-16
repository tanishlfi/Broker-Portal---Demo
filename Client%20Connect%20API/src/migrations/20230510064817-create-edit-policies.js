"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "Policies",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        policyNumber: {
          type: DataTypes.STRING,
          required: true,
        },
        brokerageId: {
          type: DataTypes.INTEGER,
        },
        providerInceptionDate: {
          type: DataTypes.DATE,
        },
        productTypeId: {
          type: DataTypes.UUID,
          required: true,
          references: {
            model: {
              tableName: "ProductTypes",
              schema: "onboarding",
              field: "id",
            },
          },
        },
        providerId: {
          type: DataTypes.INTEGER,
          required: true,
        },
        selectedCategory: {
          type: DataTypes.STRING,
          required: true,
        },
        productOptionId: {
          type: DataTypes.INTEGER,
        },
        joinDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        coverAmount: {
          type: DataTypes.FLOAT,
        },
        approverId: {
          type: DataTypes.UUID,
        },
        createdBy: {
          type: DataTypes.STRING,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedBy: {
          type: DataTypes.STRING,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        deletedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
      },
      {
        schema: "edit",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({ schema: "edit", tableName: "Policies" });
  },
};
