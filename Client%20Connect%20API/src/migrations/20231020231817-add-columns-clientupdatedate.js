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
      { schema: "onboarding", tableName: "client_update_data" },
      "memberId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "client_update_data" },
      "statedBenefitId",
      {
        type: DataTypes.INTEGER,
      },
    );

    await queryInterface.addColumn(
      { schema: "onboarding", tableName: "client_update_data" },
      "insuredLifeStatus",
      {
        type: DataTypes.INTEGER,
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
      { schema: "onboarding", tableName: "client_update_data" },
      "memberId",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "client_update_data" },
      "statedBenefitId",
    );

    await queryInterface.removeColumn(
      { schema: "onboarding", tableName: "client_update_data" },
      "insuredLifeStatus",
    );
  },
};
