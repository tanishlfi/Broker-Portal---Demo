"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "rolePlayerAddressDetails",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        memberId: DataTypes.INTEGER,
        rolePlayerId: {
          allowNull: false,
          type: DataTypes.INTEGER,
        },
        addressTypeId: DataTypes.STRING,
        addressline1: DataTypes.STRING,
        addressline2: DataTypes.STRING,
        city: DataTypes.STRING,
        province: DataTypes.STRING,
        countryId: DataTypes.INTEGER,
        postalCode: DataTypes.STRING,
        createdBy: DataTypes.STRING,
        modifiedBy: {
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
        schema: "edit",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "edit",
      tableName: "rolePlayerAddressDetails",
    });
  },
};
