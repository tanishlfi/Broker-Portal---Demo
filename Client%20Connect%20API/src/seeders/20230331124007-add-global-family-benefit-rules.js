'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert({
      schema: 'global',
      modelName: 'FamilyBenefitRule',
      tableName: 'FamilyBenefitRules'
    }, [
      {
        id: 'e1671251-6fcb-4b2a-96c2-a6c62d022db4', 
        familyMembers: 0,
        familyMemberMinAge: 0, 
        familyMemberMaxAge:0, 
        quantityOver64:0 ,
        extended: 0,
        createdAt: "2023-03-29T07:57:20.385Z",
        updatedAt: "2023-03-29T07:57:20.385Z"
      },
      {
        id: '176ac6cb-0543-432b-9c4f-b30600283f87', 
        familyMembers: 8,
        familyMemberMinAge: 18, 
        familyMemberMaxAge: 84, 
        quantityOver64: 4,
        extended: 99,
        createdAt: "2023-03-29T07:57:20.385Z",
        updatedAt: "2023-03-29T07:57:20.385Z"
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('FamilyBenefitRules', null, {});
  }
};
