"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    //     await queryInterface.addColumn(
    //       { schema: "onboarding", tableName: "Files" },
    //       "uniqueId",
    //       {
    //         type: DataTypes.STRING,
    //         unique: true,
    //       },
    //     );
  },

  async down(queryInterface, DataTypes) {
    //     await queryInterface.removeColumn(
    //       { schema: "onboarding", tableName: "Files" },
    //       "uniqueId",
    //     );
  },
};
