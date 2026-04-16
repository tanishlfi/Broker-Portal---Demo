"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Add altering commands here.
   *
   * Example:
   * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
   */
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        CREATE TABLE  onboarding.Member_old (
	MemberId int NOT NULL,
	rolePlayerId int NULL,
	IdType int NULL,
	IdNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FirstName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Surname nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateOfBirth date NULL,
	DateOfDeath date NULL,
	DeathCertificateNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	VopdVerified bit NULL,
	VopdVerificationDate datetimeoffset NULL,
	GenderId int NULL,
	CommunicationPreferenceId int NULL,
	TelephoneNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MobileNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmailAddress nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AddressTypeId int NULL,
	AddressLine1 nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AddressLine2 nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PostalCode nvarchar(6) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	City nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Province nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CountryId int NULL,
	CreatedBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatedDate datetimeoffset NULL,
	updatedBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	updatedAt datetimeoffset NOT NULL,
	deletedAt datetimeoffset NULL,
	IsStudying bit NULL,
	IsDisabled bit NULL,
	supportDocument nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	notes nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	vopdResponse nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	onboardingDataId int NULL
);`);
    } catch (error) {
      console.log(
        "Table Member_old already exists in the database no need to create it",
      );
    }

    try {
      await queryInterface.sequelize.query(`
CREATE TABLE onboarding.PolicyMember_old (
	PolicyMemberId int NOT NULL,
	PolicyDataId int NULL,
	InsuredMemberId int NOT NULL,
	PolicyHolderMemberId int NULL,
	status nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	StartDate date NULL,
	EndDate date NULL,
	MemberTypeId int NOT NULL,
	memberType nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	isBeneficiary bit NULL,
	benefitRate float NULL,
	coverMemberTypeId int NULL,
	StatedBenefitId int NULL,
	statedBenefit nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	benefit nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CoverAmount float NULL,
	Premium decimal(18,0) NULL,
	fileRow int NULL,
	exceptions nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	createdBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	createdAt datetimeoffset NOT NULL,
	updatedBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	updatedAt datetimeoffset NOT NULL,
	deletedAt datetimeoffset NULL,
	PreviousInsurer nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PreviousInsurerPolicyNumber nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PreviousInsurerJoinDate date NULL,
	PreviousInsurerCancellationDate date NULL,
	PreviousInsurerCoverAmount float NULL,
	PolicyMemberStatusId int NULL,
	ExistingMember bit NULL,
	PolicyMemberStatusReason nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	onboardingDataId int NULL
);`);
    } catch (error) {
      console.log(
        "Table PolicyMember_old already exists in the database no need to create it",
      );
    }
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    try {
      await queryInterface.sequelize.query(`
			DROP TABLE onboarding.Member_old;
		`);
    } catch (error) {
      console.log(
        "Table Member_old does not exist in the database no need to drop it",
      );
    }

    try {
      await queryInterface.sequelize.query(`
			DROP TABLE onboarding.PolicyMember_old;
		`);
    } catch (error) {
      console.log(
        "Table PolicyMember_old does not exist in the database no need to drop it",
      );
    }
  },
};
