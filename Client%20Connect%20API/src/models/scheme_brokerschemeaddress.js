"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SchemeAddress extends Model {
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
  SchemeAddress.init(
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
      AddressTypeId: {
        type: DataTypes.INTEGER,
      },
      AddressLine1: {
        type: DataTypes.STRING,
      },
      AddressLine2: {
        type: DataTypes.STRING,
      },
      PostalCode: {
        type: DataTypes.STRING,
      },
      City: {
        type: DataTypes.STRING,
      },
      Province: {
        type: DataTypes.STRING,
      },
      CountryId: {
        type: DataTypes.INTEGER,
      },
      deleteAt: {
        type: DataTypes.DATE,
      },
      CreatedBy: {
        type: DataTypes.STRING,
      },
      ModifiedBy: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "SchemeAddress",
      schema: "schemes",
      tableName: "SchemeAddresses",
    },
  );
  return SchemeAddress;
};
