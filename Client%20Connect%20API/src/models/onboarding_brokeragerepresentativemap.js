"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BrokerageRepresentativeMap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Policy }) {
      // define association here
      this.hasMany(Policy, {
        foreignKey: "BrokerageRepresentativeMapId",
        // onDelete: "CASCADE",
      });
    }
  }
  BrokerageRepresentativeMap.init(
    {
      BrokerageRepresentativeMapId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      brokerageId: { type: DataTypes.INTEGER, field: "BrokerageId" },
      representativeId: { type: DataTypes.INTEGER, field: "RepresentativeId" },
    },
    {
      sequelize,
      modelName: "BrokerageRepresentativeMap",
      schema: "onboarding",
      tableName: "BrokerageRepresentativeMap",
    },
  );
  return BrokerageRepresentativeMap;
};
