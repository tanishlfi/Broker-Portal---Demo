"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "client_update_data",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        idNumber: {
          type: DataTypes.STRING,
        },
        rolePlayerId: {
          type: DataTypes.INTEGER,
        },
        policyId: {
          type: DataTypes.INTEGER,
        },
        coverAmount: {
          type: DataTypes.FLOAT,
        },
        memberType: {
          type: DataTypes.INTEGER,
        },
        policyStatus: {
          type: DataTypes.INTEGER,
        },
        parentPolicyId: {
          type: DataTypes.INTEGER,
        },
        brokerId: {
          type: DataTypes.INTEGER,
        },
        representativeId: {
          type: DataTypes.INTEGER,
        },
        activeClaim: {
          type: DataTypes.BOOLEAN,
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
      tableName: "client_update_data",
      schema: "onboarding",
    });
  },
};
