"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.removeColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "productId",
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.addColumn(
      { schema: "rules", tableName: "BenefitRules" },
      "productId",
      {
        type: Sequelize.INTEGER,
        // allowNull: false,
      },
    );
  },
};
