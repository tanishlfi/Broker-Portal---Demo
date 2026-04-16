'use strict';
/** @type {import('DataTypes-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('FamilyBenefitRules', {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      familyMembers: {
        type: DataTypes.INTEGER
      },
      familyMemberMinAge: {
        type: DataTypes.INTEGER
      },
      familyMemberMaxAge: {
        type: DataTypes.INTEGER
      },
      quantityOver64: {
        type: DataTypes.INTEGER
      },
      extended: {
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
      schema: 'global',
      tableName: 'FamilyBenefitRules'});
  }
};