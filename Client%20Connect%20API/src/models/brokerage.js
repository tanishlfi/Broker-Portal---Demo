"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Brokerage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BrokerageImportRequest, brokerRepresentative }) {
      // define association here
      this.hasMany(BrokerageImportRequest, {
        foreignKey: "brokerageId",
      });

      this.hasMany(brokerRepresentative, {
        foreignKey: "brokerageId",
      });
    }
  }

  Brokerage.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      brokerUserId: {
        type: DataTypes.TEXT,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
      },
      FSPWebsite: {
        type: DataTypes.TEXT,
      },
      brokerageStatus: {
        type: DataTypes.STRING,
      },
      FSPNumber: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.TEXT,
      },
      tradeName: {
        type: DataTypes.TEXT,
      },
      code: {
        type: DataTypes.TEXT,
      },
      legalCapacity: {
        type: DataTypes.TEXT,
      },
      registrationNumber: {
        type: DataTypes.TEXT,
      },
      medicalAccreditationNumber: {
        type: DataTypes.TEXT,
      },
      companyType: {
        type: DataTypes.TEXT,
      },
      contactNumber: {
        type: DataTypes.TEXT,
      },
      faxNumber: {
        type: DataTypes.TEXT,
      },
      financialYearEnd: {
        type: DataTypes.DATE,
      },
      createDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Brokerage",
      schema: "broker",
      tableName: "Brokerage",
    },
  );

  return Brokerage;
};
