"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "SchemeAddresses",
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
        AddressTypeId: {
          type: DataTypes.INTEGER,
        },
        AddressLine1: {
          type: DataTypes.STRING,
        },
        AddressLine2: {
          type: DataTypes.STRING,
        },
        PostalCode: {
          type: DataTypes.STRING,
        },
        City: {
          type: DataTypes.STRING,
        },
        Province: {
          type: DataTypes.STRING,
        },
        CountryId: {
          type: DataTypes.INTEGER,
        },
        deleteAt: {
          type: DataTypes.DATE,
        },
        CreatedBy: {
          type: DataTypes.STRING,
        },
        ModifiedBy: {
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
      tableName: "SchemeAddresses",
    });
  },
};
