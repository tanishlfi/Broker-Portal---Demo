"use strict";
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "ProductOptionBenefits",
      {
        productOptionId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        benefitId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: {
              tableName: "BenefitRules",
              schema: "rules",
              field: "benefitId",
            },
            key: "benefitId",
          },
        },
      },
      {
        schema: "rules",
        timestamps: false,
        createdAt: false,
        updatedAt: false,
      },
    );
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: "ProductOptionBenefits",
      schema: "rules",
    });
  },
};
