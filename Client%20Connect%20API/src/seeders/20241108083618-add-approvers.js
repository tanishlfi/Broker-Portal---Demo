"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      { modelName: "approver", tableName: "approvers", schema: "app_data" },
      [
        // Onboarding Team
        {
          approverId: "tpursooth@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "pnaicker@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "skunene@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "nmehlo@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "tmphulane@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "bndaba@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "lmafate@randmutual.co.za",
          team: "onboarding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Edits Team
        {
          approverId: "tpursooth@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "pnaicker@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "skunene@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "nmehlo@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "tmphulane@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "bndaba@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          approverId: "lmafate@randmutual.co.za",
          team: "edits",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete(
      { modelName: "approver", tableName: "approvers", schema: "app_data" },
      null,
      {},
    );
  },
};
