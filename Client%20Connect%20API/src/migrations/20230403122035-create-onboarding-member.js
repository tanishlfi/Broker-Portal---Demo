"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "Member",
      {
        MemberId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        rolePlayerId: {
          type: DataTypes.INTEGER,
        },
        IdType: {
          type: DataTypes.INTEGER,
        },
        IdNumber: {
          type: DataTypes.STRING,
        },
        FirstName: {
          type: DataTypes.STRING,
        },
        Surname: {
          type: DataTypes.STRING,
        },
        DateOfBirth: {
          type: DataTypes.DATEONLY,
        },
        DateOfDeath: {
          type: DataTypes.DATEONLY,
        },
        DeathCertificateNumber: {
          type: DataTypes.STRING,
        },
        VopdVerified: {
          type: DataTypes.BOOLEAN,
        },
        VopdVerificationDate: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        GenderId: {
          type: DataTypes.INTEGER,
        },
        CommunicationPreferenceId: {
          type: DataTypes.INTEGER,
        },
        TelephoneNumber: {
          type: DataTypes.STRING,
        },
        MobileNumber: {
          type: DataTypes.STRING,
        },
        EmailAddress: {
          type: DataTypes.STRING,
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
          type: DataTypes.STRING(6),
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
        CreatedBy: {
          type: DataTypes.STRING,
        },
        CreatedDate: {
          type: DataTypes.DATE,
        },
        updatedBy: {
          type: DataTypes.STRING,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        deletedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
      },
      {
        paranoid: true,
        createdAt: "CreatedDate",
        deletedAt: "deletedAt",
        schema: "onboarding",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "Member",
      schema: "onboarding",
    });
  },
};
