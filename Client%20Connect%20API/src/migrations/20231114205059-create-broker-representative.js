"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "brokerRepresentatives",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        brokerageId: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        code: DataTypes.STRING,
        contactNumber: DataTypes.STRING,
        countryOfRegistration: DataTypes.STRING,
        createdBy: DataTypes.STRING,
        createdDate: DataTypes.DATE,
        dateOfAppointment: DataTypes.DATE,
        dateOfBirth: DataTypes.DATE,
        email: DataTypes.STRING,
        firstName: DataTypes.STRING,
        idNumber: DataTypes.STRING,
        idType: DataTypes.INTEGER,
        initials: DataTypes.STRING,
        isDeleted: DataTypes.BOOLEAN,
        medicalAccreditationNo: DataTypes.STRING,
        modifiedBy: DataTypes.STRING,
        modifiedDate: DataTypes.DATE,
        name: DataTypes.STRING,
        paymentFrequency: DataTypes.STRING, // Adjust the type based on your data
        paymentMethod: DataTypes.STRING, // Adjust the type based on your data
        qualifications: DataTypes.TEXT, // Assuming array of qualifications as JSON
        repType: DataTypes.INTEGER,
        representativeBankAccounts: DataTypes.TEXT, // Assuming array as JSON
        representativeChecks: DataTypes.TEXT, // Assuming array as JSON
        representativeNotes: DataTypes.TEXT, // Assuming array as JSON
        surnameOrCompanyName: DataTypes.STRING,
        title: DataTypes.STRING,
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

  async down(queryInterface) {
    await queryInterface.dropTable({
      tableName: "brokerRepresentatives",
      schema: "broker",
    });
  },
};
