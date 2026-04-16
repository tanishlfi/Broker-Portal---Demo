"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "BrokerageRepresentativeMap",
      {
        BrokerageRepresentativeMapId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        BrokerageId: {
          type: DataTypes.INTEGER,
        },
        RepresentativeId: {
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
        schema: "onboarding",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "BrokerageRepresentativeMap",
      schema: "onboarding",
    });
  },
};
