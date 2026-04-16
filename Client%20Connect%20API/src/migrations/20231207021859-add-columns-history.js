"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: DataTypes.INTEGER });
     */
    await queryInterface.addColumn({ tableName: "tableHistory" }, "before", {
      type: DataTypes.TEXT,
    });
    await queryInterface.addColumn({ tableName: "tableHistory" }, "after", {
      type: DataTypes.TEXT,
    });
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn({ tableName: "tableHistory" }, "before");
    await queryInterface.removeColumn({ tableName: "tableHistory" }, "after");
  },
};
