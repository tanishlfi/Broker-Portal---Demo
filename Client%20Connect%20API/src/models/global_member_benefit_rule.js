'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberBenefitRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasOne(BenefitRule, {
      //   as: 'rules',
      //   foreignKey: 'benefitId'
      // })
    }
  }
  MemberBenefitRule.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Main member minAge must be entered as an integer value.'
        },
        islegalMinAge(value) {
          if (parseInt(value) > parseInt(this.maxAge)) {
            throw new Error ('Illegal child minimum age specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Main member maxAge must be entered as an integer value.'
        },
        islegalMaxAge(value) {
          if (parseInt(value) < parseInt(this.minAge)) {
            throw new Error ('Illegal minimum age specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    spouse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate:{
        isInt: {
          msg: 'Main member spouse must be entered as an integer value.'
        },
        isLegalSpouseQuantity(value) {
          if(value > 2) {
            throw new Error('Illegal number of spouses specified, cannot be greater than one')
          }

          if(value < 0) {
            throw new Error('Zero is acceptable, but spouse cannot be a negative value')
          }
        }
      }
    },
    description: {
      type: DataTypes.VIRTUAL,
      get() {
        return `Rule for a main member aged between ${this.minAge} and ${this.maxAge} with ${this.spouse !== 0 ? 'a spouse': 'no spouse'} allowed.`
      }
    }
  }, {
    sequelize,
    schema: 'global',
    tableName: 'MemberBenefitRules',
    modelName: 'MemberBenefitRule'
  });
  return MemberBenefitRule;
};