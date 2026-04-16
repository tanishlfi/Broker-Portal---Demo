"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerageImportRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Brokerage }) {
      // define association here
      this.belongsTo(Brokerage, {
        foreignKey: "brokerageId",
      });
    }
  }

  BrokerageImportRequest.init(
    {
      brokerImportRequestId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      brokerageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Brokerage",
          key: "id",
        },
      },
      FSPNumber: {
        type: DataTypes.STRING(50),
      },
      representativeIdNumbers: {
        type: DataTypes.TEXT, // Using TEXT for varchar(max). In SQL Server, it maps to NVARCHAR(MAX).
      },
      requestDate: {
        type: DataTypes.DATE,
      },
      responseDate: {
        type: DataTypes.DATE,
      },
      requestUserReference: {
        type: DataTypes.STRING(30),
      },
      responseMessage: {
        type: DataTypes.TEXT, // Using TEXT for varchar(max). In SQL Server, it maps to NVARCHAR(MAX).
      },
      image: {
        type: DataTypes.TEXT, // Assuming image data is stored in text format. In SQL Server, it maps to NVARCHAR(MAX).
      },
      _info: {
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
    },
    {
      sequelize,
      modelName: "BrokerageImportRequest",
      schema: "broker",
      tableName: "brokerImportRequests",
    },
  );

  return BrokerageImportRequest;
};
