"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createSchema(`app_data`);
    await queryInterface.createTable(
      "user_meta_data",
      {
        user_id: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        BrokerageIds: {
          // type: DataTypes.ARRAY(DataTypes.TEXT),
          type: DataTypes.STRING(4000),
        },
        SchemeIds: {
          // type: DataTypes.ARRAY(DataTypes.TEXT),
          type: DataTypes.STRING(4000),
        },
        role_id: {
          type: DataTypes.TEXT,
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
    await queryInterface.dropTable({
      schema: "app_data",
      tableName: "user_meta_data",
    });
    await queryInterface.dropSchema(`app_data`);
  },
};
