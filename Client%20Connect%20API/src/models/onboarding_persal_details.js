"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PersalDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Member }) {
      // define association here
      this.belongsTo(Member, {
        foreignKey: "MemberId",
      });
    }
  }
  PersalDetail.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      MemberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PersalNumber: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      Employer: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      Department: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PersalDetail",
      schema: "onboarding",
      tableName: "PersalDetails",
    },
  );
  return PersalDetail;
};
