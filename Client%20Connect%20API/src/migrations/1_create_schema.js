"use strict";

const schemas = [
  "onboarding",
  "vopd",
  "global",
  "rules",
  "edit",
  "app_data",
  "scheme",
  "broker",
  "schemes",
];

module.exports = {
  // create all schemas

  async up(queryInterface) {
    for (let i = 0; i < schemas.length; i++) {
      await queryInterface.createSchema(`${schemas[i]}`);
    }
  },
  // drop all schemas
  // never run db:migrate:undo:all in production
  async down(queryInterface) {
    for (let i = 0; i < schemas.length; i++) {
      try {
        await queryInterface.dropSchema(`${schemas[i]}`);
      } catch (e) {
        console.log;
      }
    }
  },
};
