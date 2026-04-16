"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "AstuteResponses",
      {
        idNumber: {
          type: DataTypes.STRING(13),
          primaryKey: true,
        },
        transRef: {
          type: DataTypes.STRING,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "pending",
        },
        fullResponse: {
          type: DataTypes.STRING(4000),
        },
        firstName: {
          type: DataTypes.STRING,
        },
        surname: {
          type: DataTypes.STRING,
        },
        dateOfDeath: {
          type: DataTypes.DATEONLY,
        },
        dateOfBirth: {
          type: DataTypes.DATEONLY,
        },
        maritalStatus: {
          type: DataTypes.STRING,
        },
        gender: {
          type: DataTypes.STRING,
        },
        deceasedStatus: {
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
        schema: "vopd",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "AstuteResponses",
      schema: "vopd",
    });
  },
};
