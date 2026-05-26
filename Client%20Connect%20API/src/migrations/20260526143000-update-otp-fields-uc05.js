"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = { tableName: "bp_otps", schema: "broker" };
    
    // Check what columns actually exist
    const columns = await queryInterface.describeTable(table);

    // 1. Safely remove old or partially renamed columns
    const toRemove = [
      "expires_at", 
      "otp_expiry", 
      "status", 
      "otp_status", 
      "reference_type", 
      "is_verified", 
      "attempts", 
      "is_blocked", 
      "last_attempt_at"
    ];

    for (const col of toRemove) {
      if (columns[col]) {
        await queryInterface.removeColumn(table, col);
      }
    }

    // 2. Add final columns according to UC-05
    // MSSQL requires a DEFAULT value when adding NOT NULL columns to a non-empty table.
    await queryInterface.addColumn(table, "otp_expiry", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn(table, "otp_status", {
      // Note: If ENUM still causes syntax errors in your MSSQL version, 
      // we may need to switch to STRING with a manual check constraint.
      type: Sequelize.ENUM("Generated", "Sent", "Verified", "Expired", "Failed"),
      defaultValue: "Generated",
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    const table = { tableName: "bp_otps", schema: "broker" };
    const columns = await queryInterface.describeTable(table);

    if (columns["otp_expiry"]) await queryInterface.removeColumn(table, "otp_expiry");
    if (columns["otp_status"]) await queryInterface.removeColumn(table, "otp_status");

    // Re-add legacy columns for rollback
    await queryInterface.addColumn(table, "expires_at", { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") });
    await queryInterface.addColumn(table, "status", { type: Sequelize.STRING, defaultValue: "Generated" });
    await queryInterface.addColumn(table, "reference_type", { type: Sequelize.STRING, allowNull: false, defaultValue: "Quote" });
    await queryInterface.addColumn(table, "is_verified", { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn(table, "attempts", { type: Sequelize.INTEGER, defaultValue: 0 });
    await queryInterface.addColumn(table, "is_blocked", { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn(table, "last_attempt_at", { type: Sequelize.DATE, allowNull: true });
  },
};
