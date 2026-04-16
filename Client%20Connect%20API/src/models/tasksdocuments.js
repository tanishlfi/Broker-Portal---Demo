"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tasksDocuments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tasks }) {
      // define association here
      this.belongsTo(tasks, { foreignKey: "taskId" });
    }
  }
  tasksDocuments.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      taskId: {
        type: DataTypes.UUID,
        required: true,
      },
      documentType: {
        type: DataTypes.STRING(255),
        required: true,
      },
      fileName: {
        type: DataTypes.STRING,
      },
      orgFileName: {
        type: DataTypes.STRING(1000),
      },

      createdBy: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      schema: "app_data",
      modelName: "tasksDocuments",
      tableName: "tasksDocuments",
    },
  );
  return tasksDocuments;
};
