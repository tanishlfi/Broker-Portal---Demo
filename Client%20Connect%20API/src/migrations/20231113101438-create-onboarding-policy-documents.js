"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "PolicyDocuments",
      {
        id: {
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          type: DataTypes.UUID,
        },
        policyId: {
          type: DataTypes.INTEGER,
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
        schema: "onboarding",
      },
    );
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "PolicyDocuments",
      schema: "onboarding",
    });
  },
};
