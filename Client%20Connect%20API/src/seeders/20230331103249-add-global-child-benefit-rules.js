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
      tableName: 'ChildBenefitRules',
      modelName: 'ChildBenefitRule'
    },
    [
      {
        id:'5fa519b6-a9ca-4cad-abb2-9f6fff84f673', 
        children: 0, 
        childMinAge: 0, 
        childMaxAge: 0, 
        studentChildMinAge: 0, 
        studentChildMaxAge: 0,
        disabledChildMinAge: 0,
        disabledChildMaxAge: 0, 
        createdAt: "2023-03-29T07:57:20.385Z",
        updatedAt: "2023-03-29T07:57:20.385Z"
      },
      {
        id:'7778679a-e436-4a4e-ad33-968a77a3b65d', 
        children: 6, 
        childMinAge: 0, 
        childMaxAge: 21, 
        studentChildMinAge: 22, 
        studentChildMaxAge: 24,
        disabledChildMinAge: 22,
        disabledChildMaxAge: 200, 
        createdAt: "2023-03-29T07:57:20.385Z",
        updatedAt: "2023-03-29T07:57:20.385Z"
      }
    ]
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('ChildBenefitRules', null, {});
  }
};
