"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tableHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tableHistory.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      schemaName: {
        type: DataTypes.STRING,
      },
      tableName: {
        type: DataTypes.STRING,
      },
      tableId: {
        type: DataTypes.INTEGER,
      },
      changeType: {
        type: DataTypes.STRING,
        validate: {
          isIn: [["CREATE", "UPDATE", "DELETE"]],
        },
      },
      changedValue: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("changedValue")
            ? JSON.parse(this.getDataValue("changedValue"))
            : null;
        },
        set(value) {
          this.setDataValue("changedValue", JSON.stringify(value));
        },
      },
      before: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("before")
            ? JSON.parse(this.getDataValue("before"))
            : null;
        },
        set(value) {
          this.setDataValue("before", JSON.stringify(value));
        },
      },
      after: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("after")
            ? JSON.parse(this.getDataValue("after"))
            : null;
        },
        set(value) {
          this.setDataValue("after", JSON.stringify(value));
        },
      },
      updatedBy: {
        type: DataTypes.STRING,
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
      tableName: "tableHistory",
    },
  );
  return tableHistory;
};
