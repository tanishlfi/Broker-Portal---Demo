"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to bp_verification_results in broker schema
    await queryInterface.addColumn(
      { tableName: "bp_verification_results", schema: "broker" },
      "aml_reference",
      { type: Sequelize.STRING, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_verification_results", schema: "broker" },
      "aml_timestamp",
      { type: Sequelize.DATE, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_verification_results", schema: "broker" },
      "vopd_reference",
      { type: Sequelize.STRING, allowNull: true }
    );
    await queryInterface.addColumn(
      { tableName: "bp_verification_results", schema: "broker" },
      "verified_party_type",
      { type: Sequelize.STRING, allowNull: true }
    );

    // Note: We use the existing vopd_status and aml_status columns 
    // to store VOPDResult and AMLResult respectively.
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn({ tableName: "bp_verification_results", schema: "broker" }, "aml_reference");
    await queryInterface.removeColumn({ tableName: "bp_verification_results", schema: "broker" }, "aml_timestamp");
    await queryInterface.removeColumn({ tableName: "bp_verification_results", schema: "broker" }, "vopd_reference");
    await queryInterface.removeColumn({ tableName: "bp_verification_results", schema: "broker" }, "verified_party_type");
  },
};
