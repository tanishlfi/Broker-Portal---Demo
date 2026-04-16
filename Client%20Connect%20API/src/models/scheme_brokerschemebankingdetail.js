"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SchemeBankingDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BrokerScheme }) {
      // define association here
      this.belongsTo(BrokerScheme, {
        foreignKey: "scheme_id",
      });
    }
  }
  SchemeBankingDetail.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      scheme_id: {
        type: DataTypes.UUID,
      },
      AccountNumber: {
        type: DataTypes.STRING,
      },
      BankName: {
        type: DataTypes.STRING,
      },
      BankBranchId: {
        type: DataTypes.INTEGER,
      },
      BankAccountType: {
        type: DataTypes.STRING,
      },
      AccountHolderName: {
        type: DataTypes.STRING,
      },
      BranchCode: {
        type: DataTypes.STRING,
      },
      idNumber: {
        type: DataTypes.STRING(30),
      },
      AccountHolderInitials: {
        type: DataTypes.STRING,
      },
      AccountHolderSurname: {
        type: DataTypes.STRING,
      },
      hyphen_verification: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("hyphen_verification")
            ? JSON.parse(this.getDataValue("hyphen_verification"))
            : null;
        },
        set(value) {
          this.setDataValue("hyphen_verification", JSON.stringify(value));
        },
      },
      status: {
        type: DataTypes.STRING(4000),
        validate: {
          isIn: [["pending", "success", "failed"]],
        },
      },
    },
    {
      sequelize,
      modelName: "SchemeBankingDetail",
      schema: "schemes",
      tableName: "SchemeBankingDetails",
    },
  );
  return SchemeBankingDetail;
};
