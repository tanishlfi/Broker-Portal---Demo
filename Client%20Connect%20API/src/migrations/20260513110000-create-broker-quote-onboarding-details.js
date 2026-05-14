"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      { tableName: "bp_quote_onboarding_details", schema: "broker" },
      {
        onboarding_detail_id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        quote_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: "bp_quotes",
              schema: "broker",
            },
            key: "quote_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        lead_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: {
              tableName: "bp_leads",
              schema: "broker",
            },
            key: "lead_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        // Authorisation & Your Details
        is_authorised: { type: Sequelize.BOOLEAN, defaultValue: false },
        is_director: { type: Sequelize.BOOLEAN, defaultValue: false },
        first_name: { type: Sequelize.STRING, allowNull: true },
        surname: { type: Sequelize.STRING, allowNull: true },
        date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
        cellphone: { type: Sequelize.STRING, allowNull: true },
        landline: { type: Sequelize.STRING, allowNull: true },
        has_sa_id: { type: Sequelize.BOOLEAN, defaultValue: true },
        id_or_passport_number: { type: Sequelize.STRING, allowNull: true },
        passport_expiry: { type: Sequelize.DATEONLY, allowNull: true },
        nationality: { type: Sequelize.STRING, allowNull: true },
        home_address: { type: Sequelize.TEXT, allowNull: true },
        email_for_policy_documents: { type: Sequelize.STRING, allowNull: true },
        email_for_monthly_invoice: { type: Sequelize.STRING, allowNull: true },
        
        // Boss / MD / CEO Details
        boss_first_name: { type: Sequelize.STRING, allowNull: true },
        boss_surname: { type: Sequelize.STRING, allowNull: true },
        boss_date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
        boss_has_sa_id: { type: Sequelize.BOOLEAN, defaultValue: true },
        boss_id_or_passport: { type: Sequelize.STRING, allowNull: true },
        boss_passport_expiry: { type: Sequelize.DATEONLY, allowNull: true },
        boss_nationality: { type: Sequelize.STRING, allowNull: true },
        
        // Organisation Details
        business_type: { type: Sequelize.STRING, allowNull: true },
        country_of_incorporation: { type: Sequelize.STRING, allowNull: true },
        registered_name: { type: Sequelize.STRING, allowNull: true },
        trading_name: { type: Sequelize.STRING, allowNull: true },
        registration_number: { type: Sequelize.STRING, allowNull: true },
        stock_exchange_listing_name: { type: Sequelize.STRING, allowNull: true },
        registered_address: { type: Sequelize.TEXT, allowNull: true },
        physical_address: { type: Sequelize.TEXT, allowNull: true },
        
        // Payment Details
        bank_name: { type: Sequelize.STRING, allowNull: true },
        bank_account_number: { type: Sequelize.STRING, allowNull: true },
        bank_account_type: { type: Sequelize.STRING, allowNull: true },
        debit_day_of_month: { type: Sequelize.INTEGER, allowNull: true },
        source_of_funds: { type: Sequelize.STRING, allowNull: true },
        company_tax_number: { type: Sequelize.STRING, allowNull: true },
        company_vat_number: { type: Sequelize.STRING, allowNull: true },
        debit_order_authorised: { type: Sequelize.BOOLEAN, defaultValue: false },
        
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      }
    );

    // Add indexes
    await queryInterface.addIndex(
      { tableName: "bp_quote_onboarding_details", schema: "broker" },
      ["quote_id"]
    );
    await queryInterface.addIndex(
      { tableName: "bp_quote_onboarding_details", schema: "broker" },
      ["lead_id"]
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: "bp_quote_onboarding_details", schema: "broker" });
  },
};
