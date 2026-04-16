"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
      CREATE FUNCTION [dbo].[SynonymCalculateFuneralPolicyPremium]
      (
          @benefitRate decimal(8,4),
          @adminFeePercentage decimal(8,4),
          @commissionPercentage decimal(8,4),
          @binderFeePercentage decimal(8,4)
      )
      RETURNS decimal(8,4)
      AS
      BEGIN
          DECLARE @premium decimal(8,4)
          SET @premium = (@benefitRate / (1 - (@commissionPercentage + @binderFeePercentage))) 
                        * (1 + @adminFeePercentage)
          RETURN @premium
      END
    `);
    } catch (error) {
      console.log(
        "Function already exists in the database no need to create it",
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP FUNCTION [dbo].[SynonymCalculateFuneralPolicyPremium]
    `);
  },
};
