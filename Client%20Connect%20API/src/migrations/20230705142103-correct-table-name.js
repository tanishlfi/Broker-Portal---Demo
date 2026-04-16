"use strict";
// rename table does not work on SQL Server
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // await queryInterface.renameTable(
    //   // "BrokerageRepresentativeMaps",
    //   // "BrokerageRepresentativeMap",
    //   // { schema: "onboarding" },
    //   { schema: "onboarding", tableName: "BrokerageRepresentativeMaps" },
    //   "BrokerageRepresentativeMap",
    // );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.renameTable(
    //   { schema: "onboarding", tableName: "BrokerageRepresentativeMap" },
    //   "BrokerageRepresentativeMaps",
    // );
  },
};
