"use strict";
const { compareObjects } = require("../utils/compareObjects");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PolicyMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Policy, Member }) {
      // define association here
      this.belongsTo(Policy, {
        foreignKey: "policyId",
      });
      this.belongsTo(Member, {
        foreignKey: "memberId",
        as: "policyMember",
      });

      this.belongsTo(Member, {
        foreignKey: "PolicyHolderMemberId",
        as: "policyholder",
      });
    }
  }
  PolicyMember.init(
    {
      PolicyMemberId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      policyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "PolicyDataId",
      },
      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "InsuredMemberId",
      },
      PolicyHolderMemberId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "New",
      },
      PolicyMemberStatusId: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      PolicyMemberStatusReason: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      ExistingMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        field: "StartDate",
      },
      endDate: {
        type: DataTypes.DATEONLY,
        field: "EndDate",
      },
      memberTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        required: true,
        field: "coverMemberTypeId",
        validate: {
          isInt: {
            msg: "Not a valid number",
          },
          isIn: {
            args: [[1, 2, 3, 4, 5, 6]],
            msg: "Invalid member type",
          },
        },
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
      roleplayerTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        required: false,
        field: "MemberTypeId",
        validate: {
          isInt: {
            msg: "Not a valid number",
          },
          isIn: {
            args: [[10, 11, 32, 33, 38, 39, 41]],
            msg: "Invalid member type",
          },
        },
      },
      statedBenefitId: {
        type: DataTypes.INTEGER,
        field: "StatedBenefitId",
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
      premium: {
        type: DataTypes.DECIMAL,
        field: "Premium",
      },
      fileRow: {
        type: DataTypes.INTEGER,
      },
      PreviousInsurer: {
        type: DataTypes.STRING,
      },
      PreviousInsurerPolicyNumber: {
        type: DataTypes.STRING(50),
      },
      PreviousInsurerJoinDate: {
        type: DataTypes.DATEONLY,
      },
      PreviousInsurerCancellationDate: {
        type: DataTypes.DATEONLY,
      },
      PreviousInsurerCoverAmount: {
        type: DataTypes.FLOAT,
      },
      exceptions: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("exceptions")
            ? JSON.parse(this.getDataValue("exceptions"))
            : null;
        },
        set(value) {
          this.setDataValue("exceptions", JSON.stringify(value));
        },
      },
      createdBy: {
        type: DataTypes.STRING,
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
      sequelize,
      modelName: "PolicyMember",
      tableName: "PolicyMember",
      schema: "onboarding",
      // paranoid: true,
      hooks: {
        beforeUpdate: async (instance, options) => {
          const payload = {
            before: instance._previousDataValues,
            after: instance.dataValues,
          };

          // compare objects
          const updatedObj = compareObjects(payload.before, payload.after, [
            "memberType",
            "statedBenefit",
          ]);

          //
          // return;
          // if no changes, return
          if (Object.keys(updatedObj).length === 0) {
            return;
          }

          console.log(`member After update ${JSON.stringify(updatedObj)}`);
          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "PolicyMember",
            tableId: instance.PolicyMemberId,
            changeType: "UPDATE",
            before: payload.before,
            after: payload.after,
            updatedBy: payload.after.updatedBy,
            changedValue: updatedObj,
          };

          console.log(`History update ${JSON.stringify(historyObj)}`);

          sequelize.models.tableHistory.create(historyObj);
        },
      },
    },
  );
  return PolicyMember;
};
