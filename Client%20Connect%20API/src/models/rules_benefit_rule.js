"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BenefitRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      DependantBenefitRule,
      BenefitDependantBenefitRule,
      ProductOptionBenefit,
    }) {
      this.belongsToMany(DependantBenefitRule, {
        foreignKey: "mainBenefitId",
        through: BenefitDependantBenefitRule,
      });
      this.hasMany(ProductOptionBenefit, {
        foreignKey: "benefitId",
      });
    }
  }
  BenefitRule.init(
    {
      benefitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      benefitAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10000,
      },
      benefit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      coverMemberTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Main member minAge must be entered as an integer value.",
          },
          islegalMinAge(value) {
            if (parseInt(value) > parseInt(this.maxAge)) {
              throw new Error(
                "Illegal child minimum age specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      maxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Main member maxAge must be entered as an integer value.",
          },
          islegalMaxAge(value) {
            if (parseInt(value) < parseInt(this.minAge)) {
              throw new Error(
                "Illegal minimum age specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      spouse: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Main member spouse must be entered as an integer value.",
          },
          isLegalSpouseQuantity(value) {
            if (value > 2) {
              throw new Error(
                "Illegal number of spouses specified, cannot be greater than one",
              );
            }

            if (value < 0) {
              throw new Error(
                "Zero is acceptable, but spouse cannot be a negative value",
              );
            }
          },
        },
      },
      children: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Number of children must be entered as an integer value.",
          },
          isLegalQuantity(value) {
            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, children cannot be a negative value",
              );
            }
          },
        },
      },
      childMinAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Child member minimum age must be entered as an integer value.",
          },
          islegalMinAge(value) {
            if (parseInt(value) > parseInt(this.childMaxAge)) {
              throw new Error(
                "Illegal childMinAge specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but childMinAge cannot be a negative value",
              );
            }
          },
        },
      },
      childMaxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Child member childMaxAge must be entered as an integer value.",
          },
          isLegalMaxAge(value) {
            if (parseInt(value) < parseInt(this.childMinAge)) {
              throw new Error("Illegal maximum childMaxAge specified");
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but childMaxAge cannot be a negative value",
              );
            }
          },
        },
      },
      studentChildMinAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Child member minimum age must be entered as an integer value.",
          },
          islegalMinAge(value) {
            if (parseInt(value) > parseInt(this.studentMaxAge)) {
              throw new Error(
                "Illegal child minimum age specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      studentChildMaxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Child member maximum age must be entered as an integer value.",
          },
          islegalMaxAge(value) {
            if (parseInt(value) < parseInt(this.studentMinAge)) {
              throw new Error(
                "Illegal child minimum age specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      disabledChildMinAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Disabled child member minimum age must be entered as an integer value.",
          },
          islegalMinAge(value) {
            if (parseInt(value) > parseInt(this.disabledMaxAge)) {
              throw new Error(
                "Illegal disabledMinAge specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      disabledChildMaxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Disabled child disabledMaxAge must be entered as an integer value.",
          },
          islegalMinAge(value) {
            if (parseInt(value) < parseInt(this.disabledMinAge)) {
              throw new Error(
                "Illegal disabledMaxAge specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      familyMembers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Quantity must be entered as an integer value.",
          },
          isLegalQuantity(value) {
            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, quantityOver64 cannot be a negative value",
              );
            }
          },
        },
      },
      familyMemberMinAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Family member minimum age must be entered as an integer value.",
          },
          islegalMinAge(value) {
            if (parseInt(value) > parseInt(this.familyMemberMaxAge)) {
              throw new Error(
                "Illegal minimum age specified, cannot be greater than maximum allowed age.",
              );
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      familyMemberMaxAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Family member maximum age must be entered as an integer value.",
          },
          isLegalMaxAge(value) {
            if (parseInt(value) < parseInt(this.familyMemberMinAge)) {
              throw new Error("Illegal maximum age specified");
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, but age cannot be a negative value",
              );
            }
          },
        },
      },
      familyMembersOver64: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Quantity of family members must be entered as an integer value.",
          },
          isLegalQuantity(value) {
            if (parseInt(value) <= parseInt(this.quantity)) {
              throw new Error("Illegal quantity for members over 64 specified");
            }

            if (parseInt(value) < 0) {
              throw new Error(
                "Zero is acceptable, quantityOver64 cannot be a negative value",
              );
            }
          },
        },
      },
      extended: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 99,
          isInt: {
            msg: "Main member extended must be entered as an integer value.",
          },
          isExtendedLessThanZero(value) {
            if (value < 0) {
              throw new Error(
                "Zero is acceptable, but extended cannot be a negative value",
              );
            }
          },
        },
      },
      description: {
        type: DataTypes.VIRTUAL,
        get() {
          return `Benefit rule for main member aged between ${this.minAge} and ${this.maxAge}. With ${this.spouse} spouse(s), ${this.children} children ${this.familyMembers} familyMembers, ${this.extended} extended family allowed.`;
        },
      },
      otherBenefit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      parentBenefit: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      baseRate: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      schema: "rules",
      modelName: "BenefitRule",
      tableName: "BenefitRules",
    },
  );
  return BenefitRule;
};
