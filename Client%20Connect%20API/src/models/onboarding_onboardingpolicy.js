"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class onboardingPolicy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ onboardingData, File, PolicyCheck, onboarding_logs }) {
      // define association here

      this.hasMany(onboardingData, {
        foreignKey: "policyId",
        as: "members",
      });
      this.belongsTo(File, {
        foreignKey: "fileId",
      });
      this.hasMany(PolicyCheck, {
        foreignKey: "policyId",
        as: "checks",
      });
      this.hasMany(onboarding_logs, {
        foreignKey: "policy_id",
      });
    }
  }
  onboardingPolicy.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      providerId: {
        field: "parentPolicyId",
        type: DataTypes.INTEGER,
        required: true,
      },
      ProductOptionId: {
        type: DataTypes.INTEGER,
      },
      selectedCategory: {
        type: DataTypes.STRING,
        defaultValue: "3",
      },
      brokerageId: {
        type: DataTypes.INTEGER,
      },
      brokerageName: {
        field: "BrokerageName",
        type: DataTypes.TEXT,
      },
      providerName: {
        field: "ProviderName",
        type: DataTypes.TEXT,
      },
      providerInceptionDate: {
        type: DataTypes.DATE,
      },
      joinDate: {
        field: "PolicyInceptionDate",
        type: DataTypes.DATEONLY,
      },
      orgJoinDate: {
        field: "OrgPolicyInceptionDate",
        type: DataTypes.DATEONLY,
      },
      coverAmount: {
        type: DataTypes.FLOAT,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Processing",
      },
      statusNote: {
        type: DataTypes.STRING,
      },
      fileId: {
        type: DataTypes.UUID,
      },
      approverId: {
        type: DataTypes.STRING,
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
      allowDuplicate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      schema: "onboarding",
      tableName: "onboardingPolicies",
      paranoid: true,
      deletedAt: "deletedAt",
      hooks: {
        beforeUpdate: async (instance, options) => {
          const payload = {
            before: instance._previousDataValues,
            after: instance.dataValues,
          };
          // console.log("pre function");
          // console.log(payload);

          // compare objects
          const updatedObj = compareObjects(payload.before, payload.after, [
            "joinDate",
            "coverAmount",
            "status",
            "statusNote",
            "approverId",
          ]);

          // if no changes, return
          // if (Object.keys(updatedObj).length === 0) {
          //   return;
          // }

          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "onboardingPolicies",
            tableId: instance.id,
            changeType: "UPDATE",
            before: payload.before,
            after: payload.after,
            updatedBy: payload.after.updatedBy,
            changedValue: updatedObj,
          };

          sequelize.models.tableHistory.create(historyObj);

          // console.log(`After update ${JSON.stringify(updatedObj)}`);
        },
        beforeDestroy: async (instance, options) => {
          const payload = {
            before: instance._previousDataValues,
          };
          // console.log("pre function");
          // console.log(payload
          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "onboardingPolicies",
            tableId: instance.id,
            changeType: "DELETE",
            before: payload.before,
            updatedBy: instance.updatedBy,
          };

          sequelize.models.tableHistory.create(historyObj);
        },
      },
    },
  );
  return onboardingPolicy;
};
