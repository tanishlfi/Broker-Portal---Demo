"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "PolicyMember",
      {
        PolicyMemberId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        PolicyDataId: {
          type: DataTypes.INTEGER,
          required: true,
        },
        InsuredMemberId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        PolicyHolderMemberId: {
          type: DataTypes.INTEGER,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "New",
        },
        StartDate: {
          type: DataTypes.DATEONLY,
        },
        EndDate: {
          type: DataTypes.DATEONLY,
        },
        MemberTypeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          required: true,
        },
        memberType: {
          type: DataTypes.STRING,
        },
        isBeneficiary: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        benefitRate: {
          type: DataTypes.FLOAT,
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
          type: DataTypes.STRING(4000),
        },
        coverMemberTypeId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          required: false,
        },
        StatedBenefitId: {
          type: DataTypes.INTEGER,
        },
        statedBenefit: {
          type: DataTypes.STRING,
        },
        benefit: {
          type: DataTypes.STRING,
        },
        CoverAmount: {
          type: DataTypes.FLOAT,
        },
        Premium: {
          type: DataTypes.DECIMAL,
        },
        fileRow: {
          type: DataTypes.INTEGER,
        },
        exceptions: {
          type: DataTypes.STRING(4000),
        },
        createdBy: {
          type: DataTypes.STRING,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedBy: {
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
        paranoid: true,
        deletedAt: "deletedAt",
        schema: "onboarding",
      },
    );
    // for integer values do foreign key constraints this way
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE onboarding."PolicyMember" ADD CONSTRAINT "FK_PolicyMember_PolicyData" FOREIGN KEY ("PolicyDataId") REFERENCES onboarding."PolicyData" ("PolicyDataId");',
    // );

    // await queryInterface.sequelize.query(
    //   'ALTER TABLE onboarding."PolicyMember" ADD CONSTRAINT "FK_PolicyMember_InsuredMember" FOREIGN KEY ("InsuredMemberId") REFERENCES onboarding."Member" ("MemberId");',
    // );

    // await queryInterface.sequelize.query(
    //   'ALTER TABLE onboarding."PolicyMember" ADD CONSTRAINT "FK_PolicyMember_PolicyHolderMember" FOREIGN KEY ("PolicyHolderMemberId") REFERENCES onboarding."Member" ("MemberId");',
    // );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "PolicyMember",
      schema: "onboarding",
    });
  },
};
