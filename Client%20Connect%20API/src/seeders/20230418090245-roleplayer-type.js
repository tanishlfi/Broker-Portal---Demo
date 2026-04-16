"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize, sequelize) {
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
      {
        schema: "onboarding",
        modelName: "RoleplayerType",
        tableName: "RoleplayerTypes",
      },
      [
        {
          id: 10,
          roleplayerType: "Main Member",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
        {
          id: 11,
          roleplayerType: "Spouse",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
        {
          id: 32,
          roleplayerType: "Child",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
        {
          id: 38,
          roleplayerType: "Extended",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
        {
          id: 41,
          roleplayerType: "Beneficiary",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
        {
          id: 39,
          roleplayerType: "Disabled Child",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
        {
          id: 33,
          roleplayerType: "Special Child",
          createdAt: "2023-04-18T09:02:45.000Z",
          updatedAt: "2023-04-18T09:02:45.000Z",
        },
      ],
      {},
      {
        id: {
          autoIncrement: true,
        },
      },
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
      {
        schema: "onboarding",
        modelName: "RoleplayerType",
        tableName: "RoleplayerTypes",
      },
      null,
      {},
    );
  },
};
