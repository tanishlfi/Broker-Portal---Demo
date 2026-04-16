"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, DataTypes) => {
    try {
      await queryInterface.createTable(
        "onboardingDataHistory",
        {
          id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          policyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          fileId: {
            type: DataTypes.CHAR(36),
            allowNull: true,
          },
          fileRow: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          idValid: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          DateOfDeath: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          VopdVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          VopdVerificationDate: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          vopdResponse: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          status: {
            type: DataTypes.STRING(255),
            allowNull: true,
          },
          exceptions: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          memberType: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          memberTypeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          firstName: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          surname: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          mainMemberLinkId: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          idTypeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          idNumber: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          statedBenefitId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          statedBenefit: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          benefitName: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          joinDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          CoverAmount: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          Premium: {
            type: DataTypes.DECIMAL(18, 0),
            allowNull: true,
          },
          previousInsurer: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          previousInsurerPolicyNumber: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          previousInsurerJoinDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          previousInsurerCancellationDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          PreviousInsurerCoverAmount: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          address1: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          address2: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          city: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          province: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          country: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          areaCode: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          postalAddress1: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          postalAddress2: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          postalCity: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          postalProvince: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          postalCountry: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          postalCode: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          telephone: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          mobile: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          email: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          preferredMethodOfCommunication: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          gender: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          isStudent: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          isDisabled: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          supportDocument: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          notes: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          createdBy: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          updatedBy: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          rolePlayerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          isBeneficiary: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          alsoMember: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          MemberId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          PolicyMemberId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
        },
        {
          schema: "onboarding",
        },
      );
    } catch (error) {
      console.log("Ignore error Table already exists");
    }
  },

  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable({
      tableName: "onboardingDataHistory",
      schema: "onboarding",
    });
  },
};
