"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SchemeNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BrokerScheme }) {
      // define association here
      this.belongsTo(BrokerScheme, {
        foreignKey: "scheme_id",
      });
    }
  }
  SchemeNote.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      scheme_id: {
        type: DataTypes.UUID,
      },
      note: {
        type: DataTypes.TEXT,
      },
      active: {
        type: DataTypes.BOOLEAN,
      },
      created_by: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "SchemeNote",
      schema: "schemes",
      tableName: "SchemeNotes",
    },
  );
  return SchemeNote;
};
