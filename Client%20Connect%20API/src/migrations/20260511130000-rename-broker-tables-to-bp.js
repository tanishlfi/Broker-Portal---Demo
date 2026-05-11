"use strict";

const tables = [
  { old: "broker_leads", new: "bp_leads" },
  { old: "broker_employees", new: "bp_employees" },
  { old: "broker_employers", new: "bp_employers" },
  { old: "broker_contacts", new: "bp_contacts" },
  { old: "broker_quotes", new: "bp_quotes" },
  { old: "broker_otps", new: "bp_otps" },
  { old: "broker_otp", new: "bp_otps" }, // Check both singular and plural
  { old: "broker_verification_results", new: "bp_verification_results" },
  { old: "broker_history", new: "bp_history" },
  { old: "broker_benefits", new: "bp_benefits" },
  { old: "broker_products", new: "bp_products" },
  { old: "broker_quick_quote_data", new: "bp_quick_quote_data" },
  { old: "broker_quote_benefits", new: "bp_quote_benefits" }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const table of tables) {
      try {
        // Use raw SQL for MSSQL sp_rename
        await queryInterface.sequelize.query(
          `EXEC sp_rename 'broker.${table.old}', '${table.new}'`
        );
        console.log(`Successfully renamed ${table.old} to ${table.new}`);
      } catch (e) {
        console.log(`Skipping rename of ${table.old}: ${e.message}`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (const table of tables) {
      try {
        await queryInterface.sequelize.query(
          `EXEC sp_rename 'broker.${table.new}', '${table.old}'`
        );
      } catch (e) {
        console.log(`Skipping reverse rename of ${table.new}: ${e.message}`);
      }
    }
  },
};
