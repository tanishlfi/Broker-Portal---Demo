"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // add columns to member
    try {
      await queryInterface.addColumn(
        { schema: "onboarding", tableName: "Member" },
        "IsStudying",
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      );
      await queryInterface.addColumn(
        { schema: "onboarding", tableName: "Member" },
        "IsDisabled",
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      );
      await queryInterface.addColumn(
        { schema: "onboarding", tableName: "Member" },
        "supportDocument",
        {
          type: DataTypes.STRING(4000),
        },
      );

      // update member from policy member
      const transaction = await queryInterface.sequelize.transaction();
      try {
        // No need to use transactions for read operations
        const policyMembers = await queryInterface.sequelize.query(
          `SELECT * FROM "onboarding"."PolicyMember"`,
        );

        if (policyMembers[1] > 0) {
          for (const policyMember of policyMembers[0]) {
            if (member[1] > 0) {
              await queryInterface.sequelize.query(
                `UPDATE "onboarding"."Member" SET "IsStudying" = ${policyMember.IsStudying}, "IsDisabled" = ${policyMember.IsDisabled}, "supportDocument" = '${policyMember.supportDocument}' WHERE "MemberId" = ${policyMember.InsuredMemberId}`,
                { transaction: transaction },
              );
            }
          }

          await transaction.commit();
        }
      } catch (error) {
        // Rollback transaction if error occurs
        await transaction.rollback();
        console.error("Something went wrong: ", error);
      }

      // remove columns from policy member
      await queryInterface.removeColumn(
        { schema: "onboarding", tableName: "PolicyMember" },
        "IsStudying",
      );
      await queryInterface.removeColumn(
        { schema: "onboarding", tableName: "PolicyMember" },
        "IsDisabled",
      );
      await queryInterface.removeColumn(
        { schema: "onboarding", tableName: "PolicyMember" },
        "supportDocument",
      );
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    try {
      // add columns to policy member
      await queryInterface.addColumn(
        { schema: "onboarding", tableName: "PolicyMember" },
        "IsStudying",
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      );
      await queryInterface.addColumn(
        { schema: "onboarding", tableName: "PolicyMember" },
        "IsDisabled",
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      );
      await queryInterface.addColumn(
        { schema: "onboarding", tableName: "PolicyMember" },
        "supportDocument",
        {
          type: DataTypes.STRING(4000),
        },
      );

      // update policy member from member
      const transaction = await queryInterface.sequelize.transaction();
      try {
        // No need to use transactions for read operations
        const members = await queryInterface.sequelize.query(
          `SELECT * FROM "onboarding"."Member"`,
        );

        if (members[1] > 0) {
          for (const member of members[0]) {
            if (member[1] > 0) {
              await queryInterface.sequelize.query(
                `UPDATE "onboarding"."PolicyMember" SET "IsStudying" = ${member.IsStudying}, "IsDisabled" = ${member.IsDisabled}, "supportDocument" = '${member.supportDocument}' WHERE "InsuredMemberId" = ${member.MemberId}`,
                { transaction: transaction },
              );
            }
          }

          await transaction.commit();
        }
      } catch (error) {
        // Rollback transaction if error occurs
        await transaction.rollback();
        console.error("Something went wrong: ", eror);
      }

      // remove columns from member
      await queryInterface.removeColumn(
        { schema: "onboarding", tableName: "Member" },
        "IsStudying",
      );
      await queryInterface.removeColumn(
        { schema: "onboarding", tableName: "Member" },
        "IsDisabled",
      );
      await queryInterface.removeColumn(
        { schema: "onboarding", tableName: "Member" },
        "supportDocument",
      );
    } catch (e) {
      console.log(e);
    }
  },
};
