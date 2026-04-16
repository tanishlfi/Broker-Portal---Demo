"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      await queryInterface.createSchema(`schemes`);
    } catch (error) {
      console.log("Scheme already exists");
    }
    // create tables using raw SQL
    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.BrokerSchemes (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        BrokerageId int NULL,
        RepresentativeId int NULL,
        ProductOptionID int NULL,
        RolePlayerId int NULL,
        DisplayName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        VatRegistrationNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        ClientTypeID int NULL,
        CompanyTypeId int NULL,
        RolePlayerIdentificationTypeId int NULL,
        IdNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        TellNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        CellNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        EmailAddress nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        JoinDate datetimeoffset NULL,
        status nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        CreatedBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        ApproverId nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    } catch (error) {
      console.log("Table schemes.BrokerSchemes already exists");
    }

    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.SchemeAddresses (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        scheme_id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        AddressTypeId int NULL,
        AddressLine1 nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        AddressLine2 nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        PostalCode nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        City nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        Province nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        CountryId int NULL,
        deleteAt datetimeoffset NULL,
        CreatedBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        ModifiedBy nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    } catch (error) {
      console.log("Table schemes.SchemeAddresses already exists");
    }

    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.SchemeBankingDetails (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        scheme_id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        AccountNumber nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        BankName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        BankBranchId int NULL,
        BankAccountType nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        AccountHolderName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        BranchCode nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        idNumber nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        AccountHolderInitials nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        AccountHolderSurname nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        hyphen_verification nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        status nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    } catch (error) {
      console.log("Table schemes.SchemeBankingDetails already exists");
    }

    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.SchemeCollectionDetails (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        scheme_id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        commission_fee_percentage nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        service_fee_percentage nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        binder_fee_percentage nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        qoute_date datetimeoffset NULL,
        qoute_id nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        lives int NULL,
        premium float NULL,
        qoute_status nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    } catch (error) {
      console.log("Table schemes.SchemeCollectionDetails already exists");
    }

    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.SchemeDocuments (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        scheme_id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        DocumentType nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        FileName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        OriginalFileName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        CreatedBy nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    } catch (error) {
      console.log("Table schemes.SchemeDocuments already exists");
    }

    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.SchemeNotes (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        scheme_id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        note nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        active bit NULL,
        created_by nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );
    `);
    } catch (error) {
      console.log("Table schemes.SchemeNotes already exists");
    }

    try {
      await queryInterface.sequelize.query(`
      CREATE TABLE schemes.SchemeRoleplayers (
        id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        scheme_id char(36) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        ReferenceNo nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        ExpiryDate datetimeoffset NULL,
        GeneratedDate datetimeoffset NULL,
        Lives int NULL,
        Premium float NULL,
        status nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        CommissionFee float NULL,
        ServiceFee float NULL,
        BinderFee float NULL,
        document nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        PayDate datetimeoffset NULL,
        PaymentMethod nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        PaymentFrequency nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        PRIMARY KEY (id)
      );      
    `);
    } catch (error) {
      console.log("Table schemes.SchemeRoleplayers already exists");
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // try {
    //   await queryInterface.dropSchema(`schemes`);
    // } catch (error) {
    //   console.log("Scheme doesn't exist");
    // }
  },
};
