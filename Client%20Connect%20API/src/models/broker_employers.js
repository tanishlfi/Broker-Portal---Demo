"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerEmployer extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
    }
  }

  BrokerEmployer.init(
    {
      employer_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      employer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      registration_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      industry_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      number_of_employees: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      average_salary: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      province: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "BrokerEmployer",
      schema: "broker",
      tableName: "broker_employers",
      timestamps: true,
    },
  );

  return BrokerEmployer;
};
