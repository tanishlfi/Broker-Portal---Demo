"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "policyData",
      {
        PolicyId: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        requestId: {
          allowNull: false,
          type: DataTypes.UUID,
          primaryKey: true,
        },
        BrokerageId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        ParentPolicyNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        PolicyNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        PolicyStatus: {
          type: DataTypes.STRING,
        },
        EffectiveFrom: {
          type: DataTypes.DATE,
        },
        policyCancelReasonEnum: {
          type: DataTypes.STRING,
        },
        brokerage: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        scheme: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        FSPNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        RepresentativeIdNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ProductOptionCode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ProductOptionId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        InstallmentPremium: {
          type: DataTypes.DECIMAL,
        },
        coverAmount: {
          type: DataTypes.DECIMAL,
        },
        AdminPercentage: {
          type: DataTypes.DECIMAL,
        },
        CommissionPercentage: {
          type: DataTypes.DECIMAL,
        },
        BinderFeePercentage: {
          type: DataTypes.DECIMAL,
        },
        mainMember: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        mainMemberId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        PolicyMembers: {
          type: DataTypes.TEXT,
        },
        PolicyMembersOrg: {
          type: DataTypes.TEXT,
        },
        createdBy: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        updatedBy: {
          type: DataTypes.TEXT,
          allowNull: false,
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
        schema: "edit",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "edit",
      tableName: "policyData",
    });
  },
};
