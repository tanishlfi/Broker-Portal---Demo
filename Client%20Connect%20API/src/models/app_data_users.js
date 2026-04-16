"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
      },
      app_metadata: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("app_metadata")
            ? JSON.parse(this.getDataValue("app_metadata"))
            : null;
        },
        set(value) {
          this.setDataValue("app_metadata", JSON.stringify(value));
        },
      },
      user_metadata: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("user_metadata")
            ? JSON.parse(this.getDataValue("user_metadata"))
            : null;
        },
        set(value) {
          this.setDataValue("user_metadata", JSON.stringify(value));
        },
      },
      roles: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("roles")
            ? JSON.parse(this.getDataValue("roles"))
            : null;
        },
        set(value) {
          this.setDataValue("roles", JSON.stringify(value));
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      schema: "app_data",
      tableName: "users",
    },
  );
  return User;
};
