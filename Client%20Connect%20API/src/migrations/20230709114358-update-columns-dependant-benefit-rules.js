"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    // await queryInterface.removeColumn(
    //   { schema: "rules", tableName: "DependantBenefitRules" },
    //   "benefitId",
    // );
    await queryInterface.addColumn(
      { schema: "rules", tableName: "DependantBenefitRules" },
      "subGroup",
      {
        type: DataTypes.STRING,
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
    // await queryInterface.addColumn(
    //   { schema: "rules", tableName: "DependantBenefitRules" },
    //   "benefitId",
    //   {
    //     type: DataTypes.INTEGER,
    //   },
    // );
    await queryInterface.removeColumn(
      { schema: "rules", tableName: "DependantBenefitRules" },
      "subGroup",
    );
  },
};
