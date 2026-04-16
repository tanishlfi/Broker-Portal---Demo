"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createSchema(`app_data`);
    await queryInterface.createTable(
      "notifications",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        from_user_email: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        to_user_email: {
          type: DataTypes.TEXT,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        variant: {
          type: DataTypes.TEXT,
          isIn: [["app", "email"]],
          allowNull: false,
          defaultValue: "app",
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM,
          values: ["info", "success", "warning", "error"],
          allowNull: false,
        },
        read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        link: {
          type: DataTypes.STRING,
          allowNull: true,
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
        schema: "app_data",
      },
    );
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "app_data",
      tableName: "notifications",
    });
    await queryInterface.dropSchema(`app_data`);
  },
};
