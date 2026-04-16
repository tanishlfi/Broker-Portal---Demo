"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AstuteResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Member }) {
      // define association here
      this.hasMany(Member, {
        foreignKey: "idNumber",
      });
    }
  }
  AstuteResponse.init(
    {
      idNumber: {
        type: DataTypes.STRING(13),
        primaryKey: true,
      },
      transRef: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      fullResponse: {
        type: DataTypes.STRING(4000),
      },
      firstName: {
        type: DataTypes.STRING,
      },
      surname: {
        type: DataTypes.STRING,
      },
      dateOfDeath: {
        type: DataTypes.DATE,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
      },
      maritalStatus: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.STRING,
      },
      deceasedStatus: {
        type: DataTypes.STRING,
      },
      queueTransfer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AstuteResponse",
      tableName: "AstuteResponses",
      schema: "vopd",
      defaultScope: {
        attributes: [
          "idNumber",
          "status",
          "firstName",
          "surname",
          "dateOfDeath",
          "dateOfBirth",
          "maritalStatus",
          "gender",
          "updatedAt",
        ],
      },
    },
  );
  return AstuteResponse;
};
