"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    queryInterface.addColumn(
      { tableName: "AstuteResponses", schema: "vopd" },
      "queueTransfer",
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    );
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    queryInterface.removeColumn(
      { tableName: "AstuteResponses", schema: "vopd" },
      "queueTransfer",
    );
  },
};
