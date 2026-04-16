"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "SchemeRoleplayers",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        scheme_id: {
          type: DataTypes.UUID,
          references: {
            model: {
              tableName: "BrokerSchemes",
              schema: "schemes",
              field: "id",
            },
            key: "id",
          },
        },
        ReferenceNo: {
          type: DataTypes.STRING,
        },
        ExpiryDate: {
          type: DataTypes.DATE,
        },
        GeneratedDate: {
          type: DataTypes.DATE,
        },
        Lives: {
          type: DataTypes.INTEGER,
        },
        Premium: {
          type: DataTypes.FLOAT,
        },
        status: {
          type: DataTypes.STRING,
        },
        CommissionFee: {
          type: DataTypes.FLOAT,
        },
        ServiceFee: {
          type: DataTypes.FLOAT,
        },
        BinderFee: {
          type: DataTypes.FLOAT,
        },
        document: {
          type: DataTypes.STRING(4000),
        },
        PayDate: {
          type: DataTypes.DATE,
        },
        PaymentMethod: {
          type: DataTypes.STRING,
        },
        PaymentFrequency: {
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
        schema: "schemes",
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: "schemes",
      tableName: "SchemeRoleplayers",
    });
  },
};
