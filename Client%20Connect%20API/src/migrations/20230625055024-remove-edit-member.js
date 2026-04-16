"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // remove edit members table
    await queryInterface.dropTable({
      schema: "edit",
      tableName: "Persons",
    });
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // add back edit members table
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
};
