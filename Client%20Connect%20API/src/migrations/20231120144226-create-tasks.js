"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "tasks",
      {
        id: {
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          type: DataTypes.UUID,
        },
        title: DataTypes.TEXT,
        description: DataTypes.TEXT,
        status: DataTypes.TEXT,
        priority: DataTypes.TEXT,
        dueDate: DataTypes.DATE,
        body: {
          type: DataTypes.STRING(4000),
          get: function () {
            return this.getDataValue("exceptions")
              ? JSON.parse(this.getDataValue("exceptions"))
              : null;
          },
          set(value) {
            this.setDataValue("exceptions", JSON.stringify(value));
          },
        },
        assignee: DataTypes.STRING,
        createdBy: DataTypes.STRING,
        brokerId: {
          type: DataTypes.STRING,
        },
        schemeId: {
          type: DataTypes.STRING,
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

  async down(queryInterface) {
    await queryInterface.dropTable({
      tableName: "tasks",
      schema: "app_data",
    });
  },
};
