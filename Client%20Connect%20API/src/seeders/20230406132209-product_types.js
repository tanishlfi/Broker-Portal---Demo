"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      {
        schema: "onboarding",
        modelName: "ProductType",
        tableName: "ProductTypes",
      },
      [
        {
          id: "aa9a11bc-bb63-44d4-a496-b879a9e1e590",
          description: "Scheme",
          createdAt: "2023-04-06T13:18:54.645Z",
          updatedAt: "2023-04-06T13:18:54.645Z",
          defaultProductOptionId: null,
        },
        {
          id: "d7beb964-b2cc-479a-861b-ebd061cc2b49",
          description: "Consolidated Funeral Basic",
          createdAt: "2023-04-06T13:17:00.523Z",
          updatedAt: "2023-04-06T13:17:00.523Z",
          defaultProductOptionId: 132,
        },
        {
          id: "74fcaaae-5c78-4c72-9de4-82a072f5ec43",
          description: "Consolidated Funeral Plus",
          createdAt: "2023-04-06T13:17:00.523Z",
          updatedAt: "2023-04-06T13:17:00.523Z",
          defaultProductOptionId: 133,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete(
      {
        schema: "onboarding",
        modelName: "ProductType",
        tableName: "ProductTypes",
      },
      null,
      {},
    );
  },
};
