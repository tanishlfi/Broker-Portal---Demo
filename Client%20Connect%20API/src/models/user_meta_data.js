"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_meta_data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_meta_data.init(
    {
      user_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      BrokerageIds: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
      },
      SchemeIds: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
      },
      role_id: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "user_meta_data",
      schema: "app_data",
      tableName: "user_meta_data",
    },
  );
  return user_meta_data;
};
