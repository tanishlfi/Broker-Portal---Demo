"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class editRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ editPolicy }) {
      // define association here
      this.hasOne(editPolicy, {
        foreignKey: "requestId",
        as: "PolicyData",
      });
    }
  }
  editRequest.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      requestType: {
        type: DataTypes.TEXT,
        allowNull: true,
        // parse as array
        get: function () {
          return this.getDataValue("requestType")
            ? JSON.parse(this.getDataValue("requestType"))
            : null;
        },
        // stringify array
        set(value) {
          if (value) {
            this.setDataValue("requestType", JSON.stringify(value));
          }
        },
      },
      requestDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        get: function () {
          return this.getDataValue("requestDescription")
            ? JSON.parse(this.getDataValue("requestDescription"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("requestDescription", JSON.stringify(value));
          }
        },
      },
      requestedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      requestedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      requestStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Edit",
      },
      requestStatusNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.TEXT,
        allowNull: true,
        get: function () {
          return this.getDataValue("attachments")
            ? JSON.parse(this.getDataValue("attachments"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("attachments", JSON.stringify(value));
          }
        },
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        // set value to 30 days from the creation date
        defaultValue: function () {
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        },
      },
      createdBy: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      updatedBy: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      approverId: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approvedAt: {
        allowNull: true,
        type: DataTypes.DATE,
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
      modelName: "editRequest",
      tableName: "requests",
      schema: "edit",
    },
  );
  return editRequest;
};
