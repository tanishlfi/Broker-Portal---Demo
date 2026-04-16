"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.dropTable({
      tableName: "PolicyRolePlayers",
      schema: "edit",
    });
  },

  async down(queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.createTable(
      "PolicyRolePlayers",
      {
        policyId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: {
              tableName: "Policies",
              schema: "edit",
              field: "id",
            },
          },
        },
        memberId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: {
              tableName: "Persons",
              schema: "edit",
              field: "id",
            },
          },
        },
        rolePlayerId: {
          type: DataTypes.INTEGER,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "New",
        },
        startDate: {
          type: DataTypes.DATEONLY,
        },
        endDate: {
          type: DataTypes.DATEONLY,
        },
        joinDate: {
          type: DataTypes.DATEONLY,
        },
        isNew: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        memberTypeId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          required: false,
        },
        memberType: {
          type: DataTypes.STRING,
        },
        isBeneficiary: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        isStudent: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        notes: {
          type: DataTypes.STRING(4000),
        },
        supportDocument: {
          type: DataTypes.STRING(4000),
        },
        roleplayerTypeId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          required: false,
        },
        statedBenefitId: {
          type: DataTypes.INTEGER,
        },
        benefit: {
          type: DataTypes.STRING,
        },
        rolePlayerId: {
          type: DataTypes.INTEGER,
        },
        edits: {
          type: DataTypes.STRING(4000),
        },
        exceptions: {
          type: DataTypes.STRING(4000),
        },
        createdBy: {
          type: DataTypes.STRING,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedBy: {
          type: DataTypes.STRING,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        deletedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        },
      },
      {
        paranoid: true,
        deletedAt: "deletedAt",
        schema: "edit",
      },
    );
  },
};
