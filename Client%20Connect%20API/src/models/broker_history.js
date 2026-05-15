"use strict";
const { Model } = require("sequelize");
const { CHANGE_TYPE } = require("../enums/brokerPortalEnums");

module.exports = (sequelize, DataTypes) => {
  class BrokerHistory extends Model {
    static associate(models) {
      // define association here
    }
  }

  BrokerHistory.init(
    {
      history_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      table_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      record_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      change_type: {
        type: DataTypes.ENUM(...CHANGE_TYPE),
        allowNull: false,
      },
      before_value: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      after_value: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      changed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BrokerHistory",
      schema: "broker",
      tableName: "bp_history",
      timestamps: false, // We only need created_at
    },
  );

  return BrokerHistory;
};
