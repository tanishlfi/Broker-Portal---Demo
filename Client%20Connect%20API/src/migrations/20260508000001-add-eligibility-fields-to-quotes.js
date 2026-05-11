"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "rma_member_number",
      { type: Sequelize.STRING, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "is_permanent_employees",
      { type: Sequelize.BOOLEAN, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "is_actively_at_work",
      { type: Sequelize.BOOLEAN, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "is_replacing_policy",
      { type: Sequelize.BOOLEAN, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "replaced_policy_includes_disability",
      { type: Sequelize.BOOLEAN, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "is_policy_older_than_6_months",
      { type: Sequelize.BOOLEAN, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "replaced_policy_start_date",
      { type: Sequelize.DATE, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_quotes", schema: "broker" },
      "province",
      { type: Sequelize.STRING, allowNull: true }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "rma_member_number");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "is_permanent_employees");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "is_actively_at_work");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "is_replacing_policy");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "replaced_policy_includes_disability");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "is_policy_older_than_6_months");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "replaced_policy_start_date");
    await queryInterface.removeColumn({ tableName: "bp_quotes", schema: "broker" }, "province");
  },
};
