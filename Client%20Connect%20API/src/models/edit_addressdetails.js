"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AddressDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Member }) {
      // define association here
      this.belongsTo(Member, {
        foreignKey: "memberId",
      });
    }
  }
  AddressDetail.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      memberId: DataTypes.INTEGER,
      rolePlayerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      addressTypeId: DataTypes.STRING,
      addressline1: DataTypes.STRING,
      addressline2: DataTypes.STRING,
      city: DataTypes.STRING,
      province: DataTypes.STRING,
      countryId: DataTypes.INTEGER,
      postalCode: DataTypes.STRING,
      createdBy: DataTypes.STRING,
      modifiedBy: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      schema: "edit",
      modelName: "AddressDetail",
      tableName: "rolePlayerAddressDetails",
    },
  );
  return AddressDetail;
};
