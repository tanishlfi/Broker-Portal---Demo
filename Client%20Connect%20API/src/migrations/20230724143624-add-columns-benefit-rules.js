"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "otherBenefit",
      {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    );

    await queryInterface.addColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "parentBenefit",
      {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    );

    await queryInterface.addColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "baseRate",
      {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
    );

    await queryInterface.addColumn(
      { schema: "rules", tableName: "DependantBenefitRules" },
      "baseRate",
      {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "otherBenefit",
    );

    await queryInterface.removeColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "parentBenefit",
    );

    await queryInterface.removeColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "baseRate",
    );

    await queryInterface.removeColumn(
      { schema: "rules", tableName: "DependantBenefitRules" },
      "baseRate",
    );
  },
};
