"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "ServiceBusMessages",
      {
        ServiceBusMessageId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        RequestType: {
          type: DataTypes.STRING(30),
        },
        RequestDate: {
          type: DataTypes.DATE,
        },
        RequestReferenceNumber: {
          type: DataTypes.STRING(50),
        },
        ResponseDate: {
          type: DataTypes.DATE,
        },
        ResponseReferenceNumber: {
          type: DataTypes.STRING(50),
        },
        ResponseMessage: {
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
        schema: "onboarding",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "ServiceBusMessages",
      schema: "onboarding",
    });
  },
};
