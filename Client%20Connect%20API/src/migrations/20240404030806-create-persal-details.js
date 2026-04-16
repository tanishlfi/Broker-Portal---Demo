"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "PersalDetails",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        MemberId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        PersalNumber: {
          type: DataTypes.STRING(16),
          allowNull: false,
        },
        Employer: {
          type: DataTypes.STRING(128),
          allowNull: true,
        },
        Department: {
          type: DataTypes.STRING(128),
          allowNull: true,
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
      schema: "onboarding",
      tableName: "PersalDetails",
    });
  },
};
