"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "benefits",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        name: {
          type: DataTypes.STRING,
        },
        code: {
          type: DataTypes.STRING,
        },
        startDate: {
          type: DataTypes.DATE,
        },
        endDate: {
          type: DataTypes.DATE,
        },
        productId: {
          type: DataTypes.INTEGER,
        },
        benefitTypeId: {
          type: DataTypes.INTEGER,
        },
        coverMemberTypeId: {
          type: DataTypes.INTEGER,
        },
        coverAmount: {
          type: DataTypes.FLOAT,
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
        schema: "rules",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({ tableName: "benefits", schema: "rules" });
  },
};
