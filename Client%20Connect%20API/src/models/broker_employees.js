"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerEmployee extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
    }
  }

  BrokerEmployee.init(
    {
      employee_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      first_name: { type: DataTypes.STRING, allowNull: true },
      last_name: { type: DataTypes.STRING, allowNull: true },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      id_type: { type: DataTypes.STRING, allowNull: true },
      id_number: { type: DataTypes.STRING, allowNull: true },
      salary: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
      gender: { type: DataTypes.STRING, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "BrokerEmployee",
      schema: "broker",
      tableName: "broker_employees",
      timestamps: true,
    },
  );

  return BrokerEmployee;
};
