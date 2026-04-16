"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "onboardingData",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        policyId: {
          type: DataTypes.INTEGER,
        },
        fileId: {
          type: DataTypes.UUID,
        },
        fileRow: {
          type: DataTypes.INTEGER,
        },
        idValid: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        dateOfDeath: {
          type: DataTypes.DATEONLY,
          field: "DateOfDeath",
        },
        deathCertificateNumber: {
          type: DataTypes.STRING,
          field: "DeathCertificateNumber",
        },
        VopdVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        VopdVerificationDate: {
          type: DataTypes.DATE,
          defaultValue: null,
        },
        vopdResponse: {
          type: DataTypes.TEXT,
        },
        status: {
          type: DataTypes.STRING,
        },
        exceptions: {
          type: DataTypes.TEXT,
        },
        memberType: {
          type: DataTypes.TEXT,
        },
        memberTypeId: {
          type: DataTypes.INTEGER,
        },
        firstName: {
          type: DataTypes.TEXT,
        },
        surname: {
          type: DataTypes.TEXT,
        },
        mainMemberLinkId: {
          type: DataTypes.TEXT,
        },
        idTypeId: {
          type: DataTypes.INTEGER,
        },
        idNumber: {
          type: DataTypes.TEXT,
        },
        dateOfBirth: {
          type: DataTypes.DATEONLY,
        },
        statedBenefitId: {
          type: DataTypes.INTEGER,
        },
        statedBenefit: {
          type: DataTypes.TEXT,
        },
        benefitName: {
          type: DataTypes.TEXT,
        },
        joinDate: {
          type: DataTypes.DATEONLY,
        },
        CoverAmount: {
          type: DataTypes.FLOAT,
        },
        premium: {
          type: DataTypes.DECIMAL,
          field: "Premium",
        },
        previousInsurer: {
          type: DataTypes.TEXT,
        },
        previousInsurerPolicyNumber: {
          type: DataTypes.TEXT,
        },
        previousInsurerJoinDate: {
          type: DataTypes.DATEONLY,
        },
        previousInsurerCancellationDate: {
          type: DataTypes.DATEONLY,
        },
        PreviousInsurerCoverAmount: {
          type: DataTypes.FLOAT,
        },
        address1: {
          type: DataTypes.TEXT,
        },
        address2: {
          type: DataTypes.TEXT,
        },
        city: {
          type: DataTypes.TEXT,
        },
        province: {
          type: DataTypes.TEXT,
        },
        country: {
          type: DataTypes.TEXT,
        },
        areaCode: {
          type: DataTypes.TEXT,
        },
        postalAddress1: {
          type: DataTypes.TEXT,
        },
        postalAddress2: {
          type: DataTypes.TEXT,
        },
        postalCity: {
          type: DataTypes.TEXT,
        },
        postalProvince: {
          type: DataTypes.TEXT,
        },
        postalCountry: {
          type: DataTypes.TEXT,
        },
        postalCode: {
          type: DataTypes.TEXT,
        },
        telephone: {
          type: DataTypes.TEXT,
        },
        mobile: {
          type: DataTypes.TEXT,
        },
        email: {
          type: DataTypes.TEXT,
        },
        preferredMethodOfCommunication: {
          type: DataTypes.TEXT,
        },
        gender: {
          type: DataTypes.INTEGER,
        },
        isStudent: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        isDisabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        supportDocument: {
          type: DataTypes.TEXT,
        },
        notes: {
          type: DataTypes.TEXT,
        },
        createdBy: {
          type: DataTypes.TEXT,
        },
        updatedBy: {
          type: DataTypes.TEXT,
        },
        deletedAt: {
          allowNull: true,
          type: DataTypes.DATE,
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
        paranoid: true,
        deletedAt: "deletedAt",
      },
    );
  },
  async down(queryInterface, DataTypes) {},
};
