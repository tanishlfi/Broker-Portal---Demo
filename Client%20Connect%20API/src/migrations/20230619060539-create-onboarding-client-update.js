"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "client_updates",
      {
        idNumber: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        idTypeId: {
          type: DataTypes.INTEGER,
        },
        batchId: {
          type: DataTypes.INTEGER,
        },
        firstName: {
          type: DataTypes.STRING,
        },
        surname: {
          type: DataTypes.STRING,
        },
        numberOfPoliciesFound: {
          type: DataTypes.INTEGER,
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
      tableName: "client_updates",
      schema: "onboarding",
    });
  },
};
