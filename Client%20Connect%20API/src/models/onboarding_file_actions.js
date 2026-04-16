"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class onboarding_file_actions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ File }) {
      // This action belongs to a specific file (e.g., an onboarding application)
      // Assuming you have an 'onboarding_files' model.
      this.belongsTo(File, {
        foreignKey: "file_id",
      });
    }
  }

  onboarding_file_actions.init(
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID,
      },

      file_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      requestedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },

      assignedTo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },

      userType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.STRING(4000),
      },

      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "in_progress",
          "completed",
          "cancelled",
        ),
        defaultValue: "pending",
        allowNull: false,
      },

      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      email: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "onboarding_file_actions",
      // Sequelize will automatically add createdAt and updatedAt fields.
      // If your table is named differently, specify it here:
      // tableName: 'onboarding_file_actions',
    },
  );

  return onboarding_file_actions;
};
