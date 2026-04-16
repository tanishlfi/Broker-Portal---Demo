"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "onboardingPolicies",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        parentPolicyId: {
          type: DataTypes.INTEGER,
          required: true,
        },
        ProductOptionId: {
          type: DataTypes.INTEGER,
        },
        brokerageId: {
          type: DataTypes.INTEGER,
        },
        providerInceptionDate: {
          type: DataTypes.DATE,
        },
        PolicyInceptionDate: {
          type: DataTypes.DATE,
        },
        coverAmount: {
          type: DataTypes.FLOAT,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "Processing",
        },
        statusNote: {
          type: DataTypes.STRING,
        },
        selectedCategory: {
          type: DataTypes.STRING,
        },
        fileId: {
          type: DataTypes.UUID,
        },
        approverId: {
          type: DataTypes.STRING,
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
        updatedBy: {
          type: DataTypes.STRING,
        },
        deletedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
      },
      {
        schema: "onboarding",
        paranoid: true,
        deletedAt: "deletedAt",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "onboarding",
      tableName: "onboardingData",
    });

    await queryInterface.dropTable({
      schema: "onboarding",
      tableName: "onboardingPolicies",
      cascade: true,
      force: true,
    });
  },
};
