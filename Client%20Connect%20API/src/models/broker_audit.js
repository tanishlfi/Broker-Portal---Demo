"use strict";
const { Model } = require("sequelize");
const { AUDIT_EVENT_TYPE, ACTION_OUTCOME } = require("../enums/brokerPortalEnums");

module.exports = (sequelize, DataTypes) => {
  class BrokerAudit extends Model {
    static associate(models) {
      // define association here
    }
  }

  BrokerAudit.init(
    {
      audit_record_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      audit_event_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action_outcome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action_date_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const value = this.getDataValue("metadata");
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue("metadata", value ? JSON.stringify(value) : null);
        },
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "BrokerAudit",
      schema: "broker",
      tableName: "bp_audit",
      timestamps: false,
    },
  );

  return BrokerAudit;
};
