"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RoleplayerType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ PolicyMember }) {
      // define association here
      this.hasMany(PolicyMember, {
        foreignKey: "roleplayerTypeId",
      });
    }
  }
  RoleplayerType.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      roleplayerType: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "RoleplayerType",
      tableName: "RoleplayerTypes",
      schema: "onboarding",
    },
  );
  return RoleplayerType;
};
