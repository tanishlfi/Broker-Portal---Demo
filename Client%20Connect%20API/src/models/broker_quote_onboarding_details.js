"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BrokerQuoteOnboardingDetail extends Model {
    static associate(models) {
      this.belongsTo(models.BrokerQuote, {
        foreignKey: "quote_id",
        as: "quote",
      });
      this.belongsTo(models.BrokerLead, {
        foreignKey: "lead_id",
        as: "lead",
      });
    }
  }

  BrokerQuoteOnboardingDetail.init(
    {
      onboarding_detail_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quote_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      // Authorisation & Your Details
      is_authorised: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_director: { type: DataTypes.BOOLEAN, defaultValue: false },
      first_name: { type: DataTypes.STRING, allowNull: true },
      surname: { type: DataTypes.STRING, allowNull: true },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      cellphone: { type: DataTypes.STRING, allowNull: true },
      landline: { type: DataTypes.STRING, allowNull: true },
      has_sa_id: { type: DataTypes.BOOLEAN, defaultValue: true },
      id_or_passport_number: { type: DataTypes.STRING, allowNull: true },
      passport_expiry: { type: DataTypes.DATEONLY, allowNull: true },
      nationality: { type: DataTypes.STRING, allowNull: true },
      home_address: { type: DataTypes.TEXT, allowNull: true },
      email_for_policy_documents: { type: DataTypes.STRING, allowNull: true },
      email_for_monthly_invoice: { type: DataTypes.STRING, allowNull: true },
      
      // Boss / MD / CEO Details
      boss_first_name: { type: DataTypes.STRING, allowNull: true },
      boss_surname: { type: DataTypes.STRING, allowNull: true },
      boss_date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      boss_has_sa_id: { type: DataTypes.BOOLEAN, defaultValue: true },
      boss_id_or_passport: { type: DataTypes.STRING, allowNull: true },
      boss_passport_expiry: { type: DataTypes.DATEONLY, allowNull: true },
      boss_nationality: { type: DataTypes.STRING, allowNull: true },
      
      // Organisation Details
      business_type: { type: DataTypes.STRING, allowNull: true },
      country_of_incorporation: { type: DataTypes.STRING, allowNull: true },
      registered_name: { type: DataTypes.STRING, allowNull: true },
      trading_name: { type: DataTypes.STRING, allowNull: true },
      registration_number: { type: DataTypes.STRING, allowNull: true },
      stock_exchange_listing_name: { type: DataTypes.STRING, allowNull: true },
      registered_address: { type: DataTypes.TEXT, allowNull: true },
      physical_address: { type: DataTypes.TEXT, allowNull: true },
      
      // Payment Details
      bank_name: { type: DataTypes.STRING, allowNull: true },
      bank_account_number: { type: DataTypes.STRING, allowNull: true },
      bank_account_type: { type: DataTypes.STRING, allowNull: true },
      debit_day_of_month: { type: DataTypes.INTEGER, allowNull: true },
      source_of_funds: { type: DataTypes.STRING, allowNull: true },
      company_tax_number: { type: DataTypes.STRING, allowNull: true },
      company_vat_number: { type: DataTypes.STRING, allowNull: true },
      debit_order_authorised: { type: DataTypes.BOOLEAN, defaultValue: false },
      
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BrokerQuoteOnboardingDetail",
      schema: "broker",
      tableName: "bp_quote_onboarding_details",
      timestamps: true,
    },
  );

  return BrokerQuoteOnboardingDetail;
};
