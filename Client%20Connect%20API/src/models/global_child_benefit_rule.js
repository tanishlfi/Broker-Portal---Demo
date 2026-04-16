'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChildBenefitRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // this.hasMany(BenefitRule, {
      //   foreignKey: 'childRuleId'
      // })
      // define association here
    }
  }
  ChildBenefitRule.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    children:{
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
            throw new Error ('Zero is acceptable, quantity cannot be a negative value')
          }
        }
      }
    },
    childMinAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Child member minimum age must be entered as an integer value.'
        },
        islegalMinAge(value) {
          if (parseInt(value) > parseInt(this.childMaxAge)) {
            throw new Error ('Illegal childMinAge specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but childMinAge cannot be a negative value')
          }
        }
      }
    },
    childMaxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Child member childMaxAge must be entered as an integer value.'
        },
        isLegalMaxAge(value) {
          if (parseInt(value) < parseInt(this.childMinAge)) {
            throw new Error ('Illegal maximum childMaxAge specified')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but childMaxAge cannot be a negative value')
          }
        }
      }
    },
    studentChildMinAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Child member minimum age must be entered as an integer value.'
        },
        islegalMinAge(value) {
          if (parseInt(value) > parseInt(this.studentMaxAge)) {
            throw new Error ('Illegal child minimum age specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    studentChildMaxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Child member maximum age must be entered as an integer value.'
        },
        islegalMaxAge(value) {
          if (parseInt(value) < parseInt(this.studentMinAge)) {
            throw new Error ('Illegal child minimum age specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    disabledChildMinAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Disabled child member minimum age must be entered as an integer value.'
        },
        islegalMinAge(value) {
          if (parseInt(value) > parseInt(this.disabledMaxAge)) {
            throw new Error ('Illegal disabledMinAge specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    disabledChildMaxAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Disabled child disabledMaxAge must be entered as an integer value.'
        },
        islegalMinAge(value) {
          if (parseInt(value) < parseInt(this.disabledMinAge)) {
            throw new Error ('Illegal disabledMaxAge specified, cannot be greater than maximum allowed age.')
          }

          if (parseInt(value) < 0) {
            throw new Error ('Zero is acceptable, but age cannot be a negative value')
          }
        }
      }
    },
    description: {
      type: DataTypes.VIRTUAL,
      get() {
        return `With ${this.quantity} children allowed,aged between ${this.childMinAge} and ${this.childMaxAge}.\nStudent child aged ${this.studentMinAge} and ${this.studentMaxAge}.\nDisabled child aged ${this.disabledMinAge} and ${this.disabledMaxAge}.`
      }
    }
  }, {
    sequelize,
    schema: 'global',
    tableName: 'ChildBenefitRules',
    modelName: 'ChildBenefitRule',
  });
  return ChildBenefitRule;
};