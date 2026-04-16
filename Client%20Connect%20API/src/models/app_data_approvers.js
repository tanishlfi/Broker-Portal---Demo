"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class approver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  approver.init(
    {
      approverId: DataTypes.STRING,
      Team: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "approver",
      tableName: "approvers",
      schema: "app_data",
    },
  );
  return approver;
};
