"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class editPolicy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ editRequest }) {
      // define association here
      this.belongsTo(editRequest, {
        foreignKey: "requestId",
        as: "PolicyData",
      });
    }
  }
  editPolicy.init(
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
      policyCancelReasonId: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.DECIMAL(18, 6),
      },
      coverAmount: {
        type: DataTypes.DECIMAL(18, 6),
      },
      AdminPercentage: {
        type: DataTypes.DECIMAL,
      },
      CommissionPercentage: {
        type: DataTypes.DECIMAL(18, 6),
      },
      BinderFeePercentage: {
        type: DataTypes.DECIMAL(18, 6),
      },
      // to make search easier
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
        get: function () {
          return this.getDataValue("PolicyMembers")
            ? JSON.parse(this.getDataValue("PolicyMembers"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("PolicyMembers", JSON.stringify(value));
          }
        },
      },
      BankingDetails: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("BankingDetails")
            ? JSON.parse(this.getDataValue("BankingDetails"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("BankingDetails", JSON.stringify(value));
          }
        },
      },
      BankingDetailsOrg: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("BankingDetailsOrg")
            ? JSON.parse(this.getDataValue("BankingDetailsOrg"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("BankingDetailsOrg", JSON.stringify(value));
          }
        },
      },
      PolicyMembersOrg: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("PolicyMembersOrg")
            ? JSON.parse(this.getDataValue("PolicyMembersOrg"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("PolicyMembersOrg", JSON.stringify(value));
          }
        },
      },
      PolicyDetailsOrg: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("PolicyDetailsOrg")
            ? JSON.parse(this.getDataValue("PolicyDetailsOrg"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("PolicyDetailsOrg", JSON.stringify(value));
          }
        },
      },
      paymentMethodId: {
        type: DataTypes.INTEGER,
      },
      regularInstallmentDayOfMonth: {
        type: DataTypes.INTEGER,
      },
      decemberInstallmentDayOfMonth: {
        type: DataTypes.INTEGER,
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
      sequelize,
      modelName: "editPolicy",
      schema: "edit",
      tableName: "policyData",
    },
  );
  return editPolicy;
};
