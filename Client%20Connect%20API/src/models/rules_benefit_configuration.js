"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rules_benefit_configuration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  rules_benefit_configuration.init(
    {
      benefitId: { type: DataTypes.INTEGER, allowNull: false },
      benefitName: { type: DataTypes.STRING, allowNull: false },
      benefitAmount: { type: DataTypes.FLOAT },
      baseRate: { type: DataTypes.STRING },
      defaultBenefitMarker: { type: DataTypes.BOOLEAN },
      coverMemberType: { type: DataTypes.INTEGER },
      coverMemberTypeId: { type: DataTypes.INTEGER },
      minAge: { type: DataTypes.INTEGER },
      maxAge: { type: DataTypes.INTEGER },
      numberOfSpouses: { type: DataTypes.INTEGER },
      numberOfChildren: { type: DataTypes.INTEGER },
      numberOfOtherParents: { type: DataTypes.INTEGER },
      spouse: { type: DataTypes.BOOLEAN },
      children: { type: DataTypes.BOOLEAN },
      extended: { type: DataTypes.BOOLEAN },
      childMinAge: { type: DataTypes.INTEGER },
      childMaxAge: { type: DataTypes.INTEGER },
      studentChildMinAge: { type: DataTypes.INTEGER },
      studentChildMaxAge: { type: DataTypes.INTEGER },
      disabledChildMinAge: { type: DataTypes.INTEGER },
      disabledChildMaxAge: { type: DataTypes.INTEGER },
      familyMembers: { type: DataTypes.INTEGER },
      familyMembersOver64: { type: DataTypes.INTEGER },
      familyMemberMinAge: { type: DataTypes.INTEGER },
      familyMemberMaxAge: { type: DataTypes.INTEGER },
      parentBenefit: { type: DataTypes.INTEGER },
      otherBenefit: { type: DataTypes.INTEGER },
      addedDependentBenefits: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      schema: "rules",
      modelName: "BenefitConfiguration",
      tableName: "benefit_configuration",
      timestamps: true,
    },
  );
  return rules_benefit_configuration;
};
