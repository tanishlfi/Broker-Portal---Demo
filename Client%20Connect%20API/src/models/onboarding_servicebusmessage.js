"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ServiceBusMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ServiceBusMessage.init(
    {
      ServiceBusMessageId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      RequestType: {
        type: DataTypes.STRING(30),
      },
      RequestDate: {
        type: DataTypes.DATE,
      },
      RequestReferenceNumber: {
        type: DataTypes.STRING(50),
      },
      ResponseDate: {
        type: DataTypes.DATE,
      },
      ResponseReferenceNumber: {
        type: DataTypes.STRING(50),
      },
      ResponseMessage: {
        type: DataTypes.STRING(4000),
      },
    },
    {
      sequelize,
      modelName: "ServiceBusMessage",
      schema: "onboarding",
      tableName: "ServiceBusMessages",
    },
  );
  return ServiceBusMessage;
};
