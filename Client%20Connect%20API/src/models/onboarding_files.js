"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Policy,
      // ProductType
      onboardingPolicy,
      onboardingData,
      onboarding_file_actions,
    }) {
      // define association here
      this.hasMany(Policy, {
        foreignKey: "fileId",
      });
      this.hasMany(onboardingPolicy, {
        foreignKey: "fileId",
      });
      this.hasMany(onboardingData, {
        foreignKey: "fileId",
      });
      // this.belongsTo(ProductType, {
      //   foreignKey: "productTypeId",
      // });
      this.hasMany(onboarding_file_actions, {
        foreignKey: "file_id",
      });
    }
  }
  File.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },

      uniqueId: {
        type: DataTypes.STRING,
        unique: true,
      },

      productType: {
        type: DataTypes.STRING,
        defaultValue: "Scheme",
        field: "ProductType",
      },
      providerId: {
        type: DataTypes.INTEGER,
        required: true,
      },
      productOptionId: {
        type: DataTypes.INTEGER,
      },
      brokerageId: {
        type: DataTypes.INTEGER,
      },
      // parentPolicyId: {
      //   type: DataTypes.INTEGER,
      //   required: true,
      // },
      // SchemeRolePlayerId: {
      //   type: DataTypes.INTEGER,
      // },

      // adminPercentage: {
      //   type: DataTypes.DECIMAL,
      //   field: "AdminPercentage",
      // },
      // commissionPercentage: {
      //   type: DataTypes.DECIMAL,
      //   field: "CommissionPercentage",
      // },
      // binderFeePercentage: {
      //   type: DataTypes.DECIMAL,
      //   field: "BinderFeePercentage",
      // },
      providerInceptionDate: {
        type: DataTypes.DATE,
      },
      joinDate: {
        type: DataTypes.DATEONLY,
        required: true,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      statusDescription: {
        type: DataTypes.STRING,
        defaultValue: "New file uploaded",
      },
      fileName: {
        type: DataTypes.STRING(1000),
      },
      orgFileName: {
        type: DataTypes.STRING,
      },
      createdBy: {
        type: DataTypes.STRING,
      },
      totalRows: {
        type: DataTypes.INTEGER,
      },
      blankRows: {
        type: DataTypes.INTEGER,
      },
      processedRows: {
        type: DataTypes.INTEGER,
      },
      documents: {
        type: DataTypes.TEXT,
        defaultValue: null,
        get: function () {
          return this.getDataValue("documents")
            ? JSON.parse(this.getDataValue("documents"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("documents", JSON.stringify(value));
          }
        },
      },
      approverId: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      brokerageName: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      scheme: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "File",
      schema: "onboarding",
      tableName: "Files",
      timestamps: true,
      paranoid: true,
    },
  );
  return File;
};
