"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "SchemeCollectionDetails",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        scheme_id: {
          type: DataTypes.UUID,
        },
        commission_fee_percentage: {
          type: DataTypes.TEXT,
        },
        service_fee_percentage: {
          type: DataTypes.TEXT,
        },
        binder_fee_percentage: {
          type: DataTypes.TEXT,
        },
        qoute_date: {
          type: DataTypes.DATE,
        },
        qoute_id: {
          type: DataTypes.STRING,
        },
        lives: {
          type: DataTypes.INTEGER,
        },
        premium: {
          type: DataTypes.FLOAT,
        },
        qoute_status: {
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
        schema: "schemes",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "schemes",
      tableName: "SchemeCollectionDetails",
    });
  },
};
