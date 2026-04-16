"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class benefit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ productOption }) {
      // define association here
      this.hasMany(productOption, {
        foreignKey: "benefitId",
      });
    }
  }
  benefit.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      benefitTypeId: {
        type: DataTypes.INTEGER,
      },
      coverMemberTypeId: {
        type: DataTypes.INTEGER,
      },
      coverAmount: {
        type: DataTypes.FLOAT,
      },
      baseRate: {
        type: DataTypes.FLOAT,
      },
      benefitAmount: {
        type: DataTypes.FLOAT,
      },
      minAge: {
        type: DataTypes.INTEGER,
      },
      maxAge: {
        type: DataTypes.INTEGER,
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
      modelName: "benefit",
      tableName: "benefits",
      schema: "rules",
    },
  );
  return benefit;
};
