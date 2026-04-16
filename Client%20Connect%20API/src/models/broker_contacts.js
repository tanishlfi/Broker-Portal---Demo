"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerContact extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
    }
  }

  BrokerContact.init(
    {
      contact_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      contact_first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preferred_communication_method: {
        type: DataTypes.ENUM("Email", "SMS", "Phone"),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BrokerContact",
      schema: "broker",
      tableName: "broker_contacts",
      timestamps: true,
    },
  );

  return BrokerContact;
};
