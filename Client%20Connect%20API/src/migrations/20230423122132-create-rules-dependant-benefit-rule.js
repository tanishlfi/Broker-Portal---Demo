'use strict';
/** @type {import('DataTypes-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('DependantBenefitRules', {
      id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      benefit: {
        type: DataTypes.TEXT
      },
      maxAge: {
        type: DataTypes.INTEGER
      },
      minAge: {
        type: DataTypes.INTEGER
      },
      benefitId:{
        type: DataTypes.INTEGER
      },
      benefitAmount: {
        type: DataTypes.FLOAT
      },
      coverMemberType: {
        type: DataTypes.TEXT
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
      schema: 'rules'
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable({
      tableName: 'DependantBenefitRules',
      schema: 'rules' });
  }
};