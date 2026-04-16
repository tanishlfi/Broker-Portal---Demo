"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.addConstraint(
      { tableName: "onboardingData", schema: "onboarding" },
      {
        fields: ["policyId"],
        type: "foreign key",
        name: "fk_onboardingData_policyId",
        references: {
          table: { tableName: "onboardingPolicies", schema: "onboarding" },
          field: "id",
        },
      },
    );

    await queryInterface.addConstraint(
      { tableName: "onboardingData", schema: "onboarding" },
      {
        fields: ["fileId"],
        type: "foreign key",
        name: "fk_onboardingData_fileId",
        references: {
          table: { tableName: "Files", schema: "onboarding" },
          field: "id",
        },
      },
    );

    await queryInterface.addConstraint(
      { tableName: "onboardingPolicies", schema: "onboarding" },
      {
        fields: ["fileId"],
        type: "foreign key",
        name: "fk_onboardingPolicies_fileId",
        references: {
          table: { tableName: "Files", schema: "onboarding" },
          field: "id",
        },
      },
    );

    await queryInterface.addIndex(
      { tableName: "onboardingPolicies", schema: "onboarding" },
      ["brokerageId"],
      { name: "idx_onboardingData_brokerageId", unique: false },
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.removeConstraint(
    //   { tableName: "onboardingData", schema: "onboarding" },
    //   "fk_onboardingData_policyId",
    // );
    // await queryInterface.removeConstraint(
    //   { tableName: "onboardingData", schema: "onboarding" },
    //   "fk_onboardingData_fileId",
    // );
    // await queryInterface.removeConstraint(
    //   { tableName: "onboardingPolicies", schema: "onboarding" },
    //   "fk_onboardingPolicies_fileId",
    // );
    // await queryInterface.removeIndex(
    //   { tableName: "onboardingPolicies", schema: "onboarding" },
    //   "idx_onboardingData_brokerageId",
    // );
  },
};
