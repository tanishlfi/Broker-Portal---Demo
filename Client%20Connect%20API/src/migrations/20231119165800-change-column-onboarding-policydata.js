"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    // change column approverId type to string
    try {
      await queryInterface.changeColumn(
        {
          tableName: "PolicyData",
          schema: "onboarding",
        },
        "approverId",
        {
          type: DataTypes.STRING,
        },
      );
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // change column approverId type to uuid
    try {
      await queryInterface.changeColumn(
        {
          tableName: "PolicyData",
          schema: "onboarding",
        },
        "approverId",
        {
          type: DataTypes.UUID,
        },
      );
    } catch (e) {
      console.log(e);
    }
  },
};
