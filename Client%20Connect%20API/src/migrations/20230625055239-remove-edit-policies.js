"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.dropTable({ schema: "edit", tableName: "Policies" });
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
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
};
