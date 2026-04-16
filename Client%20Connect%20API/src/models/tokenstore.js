"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tokenStore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tokenStore.init(
    {
      token: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      expiry: {
        type: DataTypes.BIGINT,
      },
    },
    {
      sequelize,
      modelName: "tokenStore",
    },
  );
  return tokenStore;
};
