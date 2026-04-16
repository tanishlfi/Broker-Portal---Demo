"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "PolicyData",
      {
        PolicyDataId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        productTypeId: {
          type: DataTypes.UUID,
          required: true,
          references: {
            model: {
              tableName: "ProductTypes",
              schema: "onboarding",
              field: "id",
            },
          },
        },
        parentPolicyId: {
          type: DataTypes.INTEGER,
          required: true,
        },
        providerId: {
          type: DataTypes.INTEGER,
          required: true,
        },
        SchemeRolePlayerId: {
          type: DataTypes.INTEGER,
        },
        BrokerageRepresentativeMapId: {
          type: DataTypes.INTEGER,
        },
        ProductOptionId: {
          type: DataTypes.INTEGER,
        },
        brokerageId: {
          type: DataTypes.INTEGER,
        },
        PaymentFrequencyId: {
          type: DataTypes.INTEGER,
        },
        PaymentMethodId: {
          type: DataTypes.INTEGER,
        },
        providerInceptionDate: {
          type: DataTypes.DATE,
        },
        PolicyInceptionDate: {
          type: DataTypes.DATE,
        },
        InstallmentDayOfMonth: {
          type: DataTypes.INTEGER,
        },
        coverAmount: {
          type: DataTypes.FLOAT,
        },
        Premium: {
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
        ReferenceNumber: {
          type: DataTypes.STRING,
        },
        PolicyId: {
          type: DataTypes.INTEGER,
        },
        PolicyNumber: {
          type: DataTypes.STRING,
        },
        ResponseDate: {
          type: DataTypes.DATE,
        },
        ResponseCode: {
          type: DataTypes.STRING,
        },
        ResponseMessage: {
          type: DataTypes.STRING,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "Processing",
        },
        selectedCategory: {
          type: DataTypes.STRING,
          required: true,
        },
        fileId: {
          type: DataTypes.UUID,
        },
        approverId: {
          type: DataTypes.UUID,
        },
        createdBy: {
          type: DataTypes.STRING,
        },
        CreatedDate: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedBy: {
          type: DataTypes.STRING,
        },
        deletedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
      },
      {
        schema: "onboarding",
        createdAt: "CreatedDate",
        paranoid: true,
        deletedAt: "deletedAt",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "PolicyData",
      schema: "onboarding",
    });
  },
};
