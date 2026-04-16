"use strict";
const { compareObjects } = require("../utils/compareObjects");
const { Model } = require("sequelize");
// const { tableHistory } = require(".");

// const sequelizeHistory = require("sequelize-history");

module.exports = (sequelize, DataTypes) => {
  class Policy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      File,
      PolicyMember,
      // ProductType,
      Member,
      BrokerageRepresentativeMap,
      policyNote,
      PolicyCheck,
      clientUpdate,
      PolicyDocuments,
    }) {
      // define association here
      this.belongsTo(File, {
        foreignKey: "fileId",
      });
      this.hasMany(policyNote, {
        foreignKey: "policyId",
        as: "notes",
      });
      this.hasMany(clientUpdate, {
        foreignKey: "policyId",
      });
      // this.hasMany(PolicyMember, {
      //   foreignKey: "policyId",
      //   // onDelete: "CASCADE",
      // });
      this.belongsToMany(Member, {
        through: "PolicyMember",
        foreignKey: "policyId",
        as: "members",
      });
      this.hasMany(PolicyMember, {
        foreignKey: "policyId",
        // onDelete: "CASCADE",
      });
      // this.belongsTo(ProductType, {
      //   foreignKey: "productTypeId",
      // });
      this.belongsTo(BrokerageRepresentativeMap, {
        foreignKey: "BrokerageRepresentativeMapId",
      });
      this.hasMany(PolicyCheck, {
        foreignKey: "policyId",
        as: "checksEdits",
      });
      this.hasMany(PolicyDocuments, {
        foreignKey: "policyId",
      });
    }
  }
  Policy.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        field: "PolicyDataId",
      },
      actionType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "NA",
        validate: {
          isIn: [["NA", "ADD", "UPDATE"]],
        },
      },
      // productTypeId: {
      //   type: DataTypes.UUID,
      //   required: true,
      //   references: {
      //     model: {
      //       tableName: "ProductTypes",
      //       schema: "onboarding",
      //       field: "id",
      //     },
      //   },
      // },
      productType: {
        type: DataTypes.STRING,
        defaultValue: "Scheme",
        field: "ProductType",
      },
      policyStatusId: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: "StatusId",
      },
      policyCancelReasonId: {
        type: DataTypes.INTEGER,
        field: "CancelReasonId",
      },
      brokerageName: {
        type: DataTypes.TEXT,
        field: "BrokerageName",
      },
      providerName: {
        type: DataTypes.TEXT,
        field: "ProviderName",
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
      productOptionId: {
        type: DataTypes.INTEGER,
        field: "ProductOptionId",
      },
      paymentFrequencyId: {
        type: DataTypes.INTEGER,
        field: "PaymentFrequencyId",
      },
      PaymentMethodId: {
        type: DataTypes.INTEGER,
      },
      providerInceptionDate: {
        type: DataTypes.DATE,
      },
      joinDate: {
        type: DataTypes.DATE,
        field: "PolicyInceptionDate",
      },
      regularInstallmentDayOfMonth: {
        type: DataTypes.INTEGER,
        field: "InstallmentDayOfMonth",
      },
      coverAmount: {
        type: DataTypes.FLOAT,
      },
      premium: {
        type: DataTypes.DECIMAL(18, 6),
        field: "Premium",
      },
      adminPercentage: {
        type: DataTypes.DECIMAL(18, 5),
        field: "AdminPercentage",
      },
      commissionPercentage: {
        type: DataTypes.DECIMAL(18, 5),
        field: "CommissionPercentage",
      },
      binderFeePercentage: {
        type: DataTypes.DECIMAL(18, 5),
        field: "BinderFeePercentage",
      },
      PremiumAdjustmentPercentage: {
        type: DataTypes.DECIMAL(18, 5),
      },
      IsEuropAssist: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ReferenceNumber: {
        type: DataTypes.STRING(50),
        defaultValue: DataTypes.UUIDV4,
      },
      policyId: {
        type: DataTypes.INTEGER,
        field: "PolicyId",
      },
      policyNumber: {
        type: DataTypes.STRING,
        field: "PolicyNumber",
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
        defaultValue: "Draft",
        validate: {
          isIn: [
            [
              "Draft",
              "Processing",
              "Ready",
              "Error",
              "Submitted",
              "Approved",
              "Rejected",
              "Complete",
              "Issue",
            ],
          ],
        },
      },
      affordabilityStatus: {
        type: DataTypes.STRING,
        field: "AffordabilityStatus",
        validate: {
          isIn: ["Affordable", "Not Affordable"],
        },
      },
      annualIncreaseOption: {
        type: DataTypes.STRING,
        field: "AnnualIncreaseOption",
        validate: {
          isIn: ["No Increase", "Option 1", "Option 2"],
        },
      },
      increaseMonth: {
        type: DataTypes.STRING,
        field: "IncreaseMonth",
        validate: {
          isIn: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
        },
      },
      statusNote: {
        type: DataTypes.STRING,
      },
      selectedCategory: {
        type: DataTypes.STRING,
        required: true,
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
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "CreatedDate",
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
      sequelize,
      modelName: "Policy",
      tableName: "PolicyData",
      schema: "onboarding",
      paranoid: true,
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
          if (Object.keys(updatedObj).length === 0) {
            return;
          }

          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "PolicyData",
            tableId: instance.id,
            changeType: "UPDATE",
            before: payload.before,
            after: payload.after,
            updatedBy: payload.after.updatedBy,
            changedValue: updatedObj,
          };

          sequelize.models.tableHistory.create(historyObj);

          console.log(`After update ${JSON.stringify(updatedObj)}`);
        },
      },
    },
  );

  // sequelizeHistory(Policy, sequelize);
  return Policy;
};
