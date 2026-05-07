"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 0. Cleanup from previous failed attempts
    try {
      await queryInterface.dropTable({ tableName: "broker_benefits", schema: "broker" });
      await queryInterface.dropTable({ tableName: "broker_products", schema: "broker" });
    } catch (e) {}

    // 1. broker_products
    await queryInterface.createTable(
      "broker_products",
      {
        product_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        product_name: { type: Sequelize.STRING, allowNull: false, unique: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { schema: "broker" }
    );

    // 2. broker_benefits (The Catalog)
    await queryInterface.createTable(
      "broker_benefits",
      {
        benefit_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        product_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: "broker_products", schema: "broker" }, key: "product_id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        benefit_name: { type: Sequelize.STRING, allowNull: false },
        benefit_type: { type: Sequelize.ENUM("Life", "Funeral", "Accident", "VAPS"), allowNull: false },
        is_mandatory: { type: Sequelize.BOOLEAN, defaultValue: false },
        is_embedded: { type: Sequelize.BOOLEAN, defaultValue: false },
        default_cover_amount: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { schema: "broker" }
    );

    // Seed initial products as per BRS
    const now = new Date();
    await queryInterface.bulkInsert({ tableName: "broker_products", schema: "broker" }, [
      {
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        product_name: "Life Cover",
        description: "Group Life Cover providing financial security.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        product_id: "550e8400-e29b-41d4-a716-446655440001",
        product_name: "Funeral Cover",
        description: "Dignified funeral insurance for employees and families.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        product_id: "550e8400-e29b-41d4-a716-446655440002",
        product_name: "Occupational Disability Cover (GPA)",
        description: "Protection against occupational disability.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed initial benefits as per BRS/FRS (Core Benefits Only)
    await queryInterface.bulkInsert({ tableName: "broker_benefits", schema: "broker" }, [
      // Life Cover Benefit
      {
        benefit_id: Sequelize.literal('NEWID()'),
        product_id: "550e8400-e29b-41d4-a716-446655440000",
        benefit_name: "Group Life Cover",
        benefit_type: "Life",
        is_mandatory: true,
        is_embedded: false,
        default_cover_amount: 100000.00, // Can be fixed or salary multiple
        createdAt: now,
        updatedAt: now,
      },
      // Funeral Cover Benefit
      {
        benefit_id: Sequelize.literal('NEWID()'),
        product_id: "550e8400-e29b-41d4-a716-446655440001",
        benefit_name: "Group Funeral Cover",
        benefit_type: "Funeral",
        is_mandatory: true,
        is_embedded: false,
        default_cover_amount: 50000.00, // Max limit R50,000
        createdAt: now,
        updatedAt: now,
      },
      // Occupational Disability Cover (GPA) Benefit
      {
        benefit_id: Sequelize.literal('NEWID()'),
        product_id: "550e8400-e29b-41d4-a716-446655440002",
        benefit_name: "Occupational Disability Cover (GPA)",
        benefit_type: "Accident",
        is_mandatory: true,
        is_embedded: false,
        default_cover_amount: 100000.00, // Subject to 6-month waiting period
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: "broker_benefits", schema: "broker" });
    await queryInterface.dropTable({ tableName: "broker_products", schema: "broker" });
  },
};
