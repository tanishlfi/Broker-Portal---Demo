"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SchemeCollectionDetail extends Model {
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
  SchemeCollectionDetail.init(
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
      commission_fee_percentage: {
        type: DataTypes.TEXT,
      },
      service_fee_percentage: {
        type: DataTypes.TEXT,
      },
      binder_fee_percentage: {
        type: DataTypes.TEXT,
      },
      qoute_date: {
        type: DataTypes.DATE,
      },
      qoute_id: {
        type: DataTypes.STRING,
      },
      lives: {
        type: DataTypes.INTEGER,
      },
      premium: {
        type: DataTypes.FLOAT,
      },
      qoute_status: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "SchemeCollectionDetail",
      schema: "schemes",
      tableName: "SchemeCollectionDetails",
    },
  );
  return SchemeCollectionDetail;
};
