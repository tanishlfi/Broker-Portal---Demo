'use strict';
/** @type {import('DataTypes-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('MemberBenefitRules', {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      minAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }, 
      maxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      spouse: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
      tableName: 'MemberBenefitRules',
      schema: 'global'
    });
  }
};