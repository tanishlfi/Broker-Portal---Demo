"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    try {
      await queryInterface.createSchema(`schemes`);
      await queryInterface.createTable(
        "BrokerSchemes",
        {
          id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
          },
          BrokerageId: {
            type: DataTypes.INTEGER,
          },
          RepresentativeId: {
            type: DataTypes.INTEGER,
          },
          ProductOptionID: {
            type: DataTypes.INTEGER,
          },
          RolePlayerId: {
            type: DataTypes.INTEGER,
          },
          DisplayName: {
            type: DataTypes.STRING,
          },
          VatRegistrationNumber: {
            type: DataTypes.STRING,
          },
          ClientTypeID: {
            type: DataTypes.INTEGER,
          },
          CompanyTypeId: {
            type: DataTypes.INTEGER,
          },
          RolePlayerIdentificationTypeId: {
            type: DataTypes.INTEGER,
          },
          IdNumber: {
            type: DataTypes.STRING,
          },
          TellNumber: {
            type: DataTypes.STRING,
          },
          CellNumber: {
            type: DataTypes.STRING,
          },
          EmailAddress: {
            type: DataTypes.STRING,
          },
          JoinDate: {
            type: DataTypes.DATE,
          },
          status: {
            type: DataTypes.STRING,
          },
          CreatedBy: {
            type: DataTypes.STRING,
          },
          ApproverId: {
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
    } catch (e) {
      console.log(e);
    }
  },
  async down(queryInterface, DataTypes) {
    try {
      await queryInterface.dropTable({
        schema: "schemes",
        tableName: "BrokerSchemes",
      });
      await queryInterface.dropSchema(`schemes`);
    } catch (e) {
      console.log(e);
    }
  },
};
