"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "Persons",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        rolePlayerId: {
          type: DataTypes.INTEGER,
        },
        idTypeId: {
          type: DataTypes.INTEGER,
        },
        idNumber: {
          type: DataTypes.STRING,
        },
        firstName: {
          type: DataTypes.STRING,
        },
        surname: {
          type: DataTypes.STRING,
        },
        dateOfBirth: {
          type: DataTypes.DATEONLY,
        },
        dateOfDeath: {
          type: DataTypes.DATEONLY,
        },
        deathCertificateNumber: {
          type: DataTypes.STRING,
        },
        vopdVerified: {
          type: DataTypes.BOOLEAN,
        },
        vopdVerificationDate: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        genderId: {
          type: DataTypes.INTEGER,
        },
        communicationPreferenceId: {
          type: DataTypes.INTEGER,
        },
        telephoneNumber: {
          type: DataTypes.STRING,
        },
        mobileNumber: {
          type: DataTypes.STRING,
        },
        emailAddress: {
          type: DataTypes.STRING,
        },
        edits: {
          type: DataTypes.STRING(4000),
        },
        editReason: {
          type: DataTypes.TEXT,
        },
        createdBy: {
          type: DataTypes.STRING,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        modifiedBy: {
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
        schema: "edit",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "edit",
      tableName: "Persons",
    });
  },
};
