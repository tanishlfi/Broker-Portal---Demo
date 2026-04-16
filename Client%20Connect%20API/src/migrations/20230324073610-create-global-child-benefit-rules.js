'use strict';
/** @type {import('DataTypes-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('ChildBenefitRules', {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      children: {
        type: DataTypes.INTEGER
      },
      childMinAge: {
        type: DataTypes.INTEGER
      },
      childMaxAge: {
        type: DataTypes.INTEGER
      },
      studentChildMinAge: {
        type: DataTypes.INTEGER
      },
      studentChildMaxAge: {
        type: DataTypes.INTEGER
      },
      disabledChildMinAge: {
        type: DataTypes.INTEGER
      },
      disabledChildMaxAge: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },{
      schema: 'global'
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      schema: 'global',
      tableName: 'ChildBenefitRules'
    });
  }
};