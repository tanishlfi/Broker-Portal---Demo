"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema("rules", { ifNotExists: true });

    await queryInterface.createTable(
      {
        tableName: "benefit_configuration",
        schema: "rules",
      },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        benefitId: { type: Sequelize.INTEGER, allowNull: false },
        benefitName: { type: Sequelize.STRING, allowNull: false },
        benefitAmount: Sequelize.FLOAT,
        baseRate: Sequelize.STRING,
        defaultBenefitMarker: Sequelize.BOOLEAN,
        coverMemberType: Sequelize.INTEGER,
        coverMemberTypeId: Sequelize.INTEGER,
        minAge: Sequelize.INTEGER,
        maxAge: Sequelize.INTEGER,
        numberOfSpouses: Sequelize.INTEGER,
        numberOfChildren: Sequelize.INTEGER,
        numberOfOtherParents: Sequelize.INTEGER,
        spouse: Sequelize.BOOLEAN,
        children: Sequelize.BOOLEAN,
        extended: Sequelize.BOOLEAN,
        childMinAge: Sequelize.INTEGER,
        childMaxAge: Sequelize.INTEGER,
        studentChildMinAge: Sequelize.INTEGER,
        studentChildMaxAge: Sequelize.INTEGER,
        disabledChildMinAge: Sequelize.INTEGER,
        disabledChildMaxAge: Sequelize.INTEGER,
        familyMembers: Sequelize.INTEGER,
        familyMembersOver64: Sequelize.INTEGER,
        familyMemberMinAge: Sequelize.INTEGER,
        familyMemberMaxAge: Sequelize.INTEGER,
        parentBenefit: Sequelize.INTEGER,
        otherBenefit: Sequelize.INTEGER,
        addedDependentBenefits: Sequelize.TEXT,
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      tableName: "benefit_configuration",
      schema: "rules",
    });
  },
};
