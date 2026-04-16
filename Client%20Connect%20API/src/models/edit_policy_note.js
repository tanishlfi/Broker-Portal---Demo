"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class policyNote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Policy }) {
      // define association here
      this.belongsTo(Policy, {
        foreignKey: "policyId",
        as: "notes",
      });
    }
  }
  policyNote.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      policyId: {
        type: DataTypes.INTEGER,
      },
      note: {
        type: DataTypes.TEXT,
      },
      createdBy: {
        type: DataTypes.TEXT,
      },
      updateBy: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "policyNote",
      schema: "edit",
      tableName: "policyNotes",
    },
  );
  return policyNote;
};
