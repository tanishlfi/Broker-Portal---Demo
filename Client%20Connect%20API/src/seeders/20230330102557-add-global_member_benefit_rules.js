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
      tableName: 'MemberBenefitRules',
      modelName: 'MemberBenefitRule'
    },
    [
      {id: 'b22d1f21-942c-4daa-87ea-7308e9baefd2', minAge: 18, maxAge: 64, spouse: 0,
      createdAt: "2023-03-29T07:57:20.385Z",
      updatedAt: "2023-03-29T07:57:20.385Z"},
      {id: '816999a5-334f-401a-9474-a7e0558172c6', minAge: 18, maxAge: 64, spouse: 1,
      createdAt: "2023-03-29T07:57:20.385Z",
      updatedAt: "2023-03-29T07:57:20.385Z"},
      {id: 'e4cb7a68-aefd-403c-9ab9-71c0593a56b4', minAge: 65, maxAge: 84, spouse: 0,
      createdAt: "2023-03-29T07:57:20.385Z",
      updatedAt: "2023-03-29T07:57:20.385Z"},
      {id: '0977e402-e4b7-456d-948a-c2b5c33bed51', minAge: 65, maxAge: 84, spouse: 1,
      createdAt: "2023-03-29T07:57:20.385Z",
      updatedAt: "2023-03-29T07:57:20.385Z"},
      {id: '700d8238-1066-4d93-b8e5-f0b08357d7b6', minAge: 85, maxAge: 100, spouse: 0,
      createdAt: "2023-03-29T07:57:20.385Z",
      updatedAt: "2023-03-29T07:57:20.385Z"},
      {id: 'e24800ce-4e08-4ef6-a458-670395dace8f', minAge: 85, maxAge: 100, spouse: 1,
      createdAt: "2023-03-29T07:57:20.385Z",
      updatedAt: "2023-03-29T07:57:20.385Z"},
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete({
      schema:'rules',
      modelName:'MemberBenefitRule',
      tableName:'MemberBenefitRules'
  }, null, {})
  }
};
