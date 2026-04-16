"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tasks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tasksDocuments }) {
      // define association here
      this.hasMany(tasksDocuments, { foreignKey: "taskId" });
    }
  }
  tasks.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
      status: DataTypes.TEXT,
      priority: DataTypes.TEXT,
      dueDate: DataTypes.DATE,
      body: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("body")
            ? JSON.parse(this.getDataValue("body"))
            : null;
        },
        set(value) {
          this.setDataValue("body", JSON.stringify(value));
        },
      },

      brokerId: {
        type: DataTypes.STRING,
      },
      schemeId: {
        type: DataTypes.STRING,
      },
      assignee: DataTypes.STRING,
      createdBy: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      schema: "app_data",
      modelName: "tasks",
      tableName: "tasks",
    },
  );
  return tasks;
};
