"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SupportDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({}) {
      // define association here
    }
  }
  SupportDocument.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
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
      modelName: "SupportDocument",
      schema: "global",
      tableName: "SupportDocuments",
    },
  );
  return SupportDocument;
};
