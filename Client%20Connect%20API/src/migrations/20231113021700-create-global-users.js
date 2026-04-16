"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        user_id: {
          type: DataTypes.STRING,
        },
        email: {
          type: DataTypes.STRING,
        },
        blocked: {
          type: DataTypes.BOOLEAN,
        },
        app_metadata: {
          type: DataTypes.STRING(4000),
        },
        roles: {
          type: DataTypes.STRING(4000),
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
        schema: "app_data",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({ tableName: "users", schema: "app_data" });
  },
};
