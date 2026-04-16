"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    // createSchema is not existing
    await queryInterface.createSchema("broker");
    await queryInterface.createTable(
      "Brokerage",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        brokerUserId: {
          type: DataTypes.TEXT,
        },
        status: {
          type: DataTypes.STRING,
        },
        FSPWebsite: {
          type: DataTypes.TEXT,
        },
        brokerageStatus: {
          type: DataTypes.STRING,
        },
        FSPNumber: {
          type: DataTypes.TEXT,
        },
        name: {
          type: DataTypes.TEXT,
        },
        tradeName: {
          type: DataTypes.TEXT,
        },
        code: {
          type: DataTypes.TEXT,
        },
        legalCapacity: {
          type: DataTypes.TEXT,
        },
        registrationNumber: {
          type: DataTypes.TEXT,
        },
        medicalAccreditationNumber: {
          type: DataTypes.TEXT,
        },
        companyType: {
          type: DataTypes.TEXT,
        },
        contactNumber: {
          type: DataTypes.TEXT,
        },
        faxNumber: {
          type: DataTypes.TEXT,
        },
        financialYearEnd: {
          type: DataTypes.DATE,
        },
        createDate: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
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
        schema: "broker",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropSchema("broker");
    await queryInterface.dropTable({
      tableName: "Brokerage",
      schema: "broker",
    });
  },
};
