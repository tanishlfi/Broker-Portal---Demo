"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable(
      "BenefitDependantBenefitRules",
      {
        mainBenefitId: {
          type: DataTypes.INTEGER,
          references: {
            model: {
              tableName: "BenefitRules",
              schema: "rules",
              field: "benefitId",
            },
            key: "benefitId",
          },
        },
        dependantBenefitId: {
          type: DataTypes.INTEGER,
          references: {
            model: {
              tableName: "DependantBenefitRules",
              schema: "rules",
              field: "id",
            },
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      schema: "rules",
      tableName: "BenefitDependantBenefitRules",
    });
  },
};
