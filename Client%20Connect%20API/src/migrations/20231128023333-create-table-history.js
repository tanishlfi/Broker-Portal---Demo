"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("tableHistory", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      schemaName: {
        type: DataTypes.STRING,
      },
      tableName: {
        type: DataTypes.STRING,
      },
      tableId: {
        type: DataTypes.INTEGER,
      },
      changeType: {
        type: DataTypes.STRING,
      },
      changedValue: {
        type: DataTypes.TEXT,
      },
      updatedBy: {
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
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("tableHistory");
  },
};
