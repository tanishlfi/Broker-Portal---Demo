'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FamilyBenefitRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasMany(BenefitRule, {
      //   foreignKey: 'familyMemberRuleId'
      // })
    }
  }
  FamilyBenefitRule.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    familyMembers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Quantity must be entered as an integer value.'
        }
        ,
        isLegalQuantity(value) {
          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, quantityOver64 cannot be a negative value')
          }
        }
      }
    },
    familyMemberMinAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Family member minimum age must be entered as an integer value.'
        },
        islegalMinAge(value) {
          if (parseInt(value) > parseInt(this.familyMemberMaxAge)) {
            throw new Error ('Illegal minimum age specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    familyMemberMaxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Family member maximum age must be entered as an integer value.'
        },
        isLegalMaxAge(value) {
          if (parseInt(value) < parseInt(this.familyMemberMinAge)) {
            throw new Error ('Illegal maximum age specified')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    quantityOver64: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Quantity of family members must be entered as an integer value.'
        },
        isLegalQuantity(value) {
          if (parseInt(value) <= parseInt(this.quantity)) {
            throw new Error ('Illegal quantity for members over 64 specified')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, quantityOver64 cannot be a negative value')
          }
        }
      }
    },
    extended: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 99
      }
    },
    description: {
      type: DataTypes.VIRTUAL,
      get() {
        return `With ${this.quantity} family member's allowed,aged between ${this.familyMemberMinAge} and ${this.familyMemberMaxAge}.\n With up to ${this.quantityOver64} family members over the age of 64.`
      }
    }
  }, {
    sequelize,
    schema: 'global',
    tableName: 'FamilyBenefitRules',
    modelName: 'FamilyBenefitRule',
  });
  return FamilyBenefitRule;
};