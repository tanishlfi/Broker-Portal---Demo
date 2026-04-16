"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "productOptions",
      {
        productOptionId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        benefitId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
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
    await queryInterface.dropTable({
      tableName: "productOptions",
      schema: "rules",
    });
  },
};
