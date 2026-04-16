"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class fileDataOrg extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  fileDataOrg.init(
    {
      fileId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      fileRow: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      idValid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      memberType: {
        type: DataTypes.TEXT,
      },
      firstName: {
        type: DataTypes.TEXT,
      },
      surname: {
        type: DataTypes.TEXT,
      },
      mainMemberLinkId: {
        type: DataTypes.TEXT,
      },
      idNumber: {
        type: DataTypes.TEXT,
      },
      passportNumber: {
        type: DataTypes.TEXT,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
      },
      benefitName: {
        type: DataTypes.TEXT,
      },
      joinDate: {
        type: DataTypes.DATEONLY,
      },
      previousInsurer: {
        type: DataTypes.TEXT,
      },
      previousInsurerPolicyNumber: {
        type: DataTypes.TEXT,
      },
      previousInsurerJoinDate: {
        type: DataTypes.DATEONLY,
      },
      previousInsurerCancellationDate: {
        type: DataTypes.DATEONLY,
      },
      address1: {
        type: DataTypes.TEXT,
      },
      address2: {
        type: DataTypes.TEXT,
      },
      city: {
        type: DataTypes.TEXT,
      },
      province: {
        type: DataTypes.TEXT,
      },
      country: {
        type: DataTypes.TEXT,
      },
      areaCode: {
        type: DataTypes.TEXT,
      },
      postalAddress1: {
        type: DataTypes.TEXT,
      },
      postalAddress2: {
        type: DataTypes.TEXT,
      },
      postalCity: {
        type: DataTypes.TEXT,
      },
      postalProvince: {
        type: DataTypes.TEXT,
      },
      postalCountry: {
        type: DataTypes.TEXT,
      },
      postalCode: {
        type: DataTypes.TEXT,
      },
      telephone: {
        type: DataTypes.TEXT,
      },
      mobile: {
        type: DataTypes.TEXT,
      },
      email: {
        type: DataTypes.TEXT,
      },
      preferredMethodOfCommunication: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "fileDataOrg",
      schema: "onboarding",
    },
  );
  return fileDataOrg;
};
