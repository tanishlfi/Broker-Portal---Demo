"use strict";
/** @type {import('DataTypes-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "BenefitRules",
      {
        productId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        benefitId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        benefitAmount: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 10000,
        },
        benefit: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        coverMemberTypeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        minAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        maxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        spouse: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        children: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        childMinAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        childMaxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        studentChildMinAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        studentChildMaxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        disabledChildMinAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        disabledChildMaxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        familyMembers: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        familyMemberMinAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        familyMemberMaxAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        familyMembersOver64: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        extended: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
        schema: "rules",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "BenefitRules",
      schema: "rules",
    });
  },
};
