"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class brokerRepresentative extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Brokerage }) {
      // define association here

      this.belongsTo(Brokerage, {
        foreignKey: "brokerageId",
      });
    }
  }
  brokerRepresentative.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      brokerageId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      code: DataTypes.STRING,
      contactNumber: DataTypes.STRING,
      countryOfRegistration: DataTypes.STRING,
      createdBy: DataTypes.STRING,
      createdDate: DataTypes.DATE,
      dateOfAppointment: DataTypes.DATE,
      dateOfBirth: DataTypes.DATE,
      email: DataTypes.STRING,
      firstName: DataTypes.STRING,
      idNumber: DataTypes.STRING,
      idType: DataTypes.INTEGER,
      initials: DataTypes.STRING,
      isDeleted: DataTypes.BOOLEAN,
      medicalAccreditationNo: DataTypes.STRING,
      modifiedBy: DataTypes.STRING,
      modifiedDate: DataTypes.DATE,
      name: DataTypes.STRING,
      paymentFrequency: DataTypes.STRING, // Adjust the type based on your data
      paymentMethod: DataTypes.STRING, // Adjust the type based on your data
      qualifications: DataTypes.JSON, // Assuming array of qualifications as JSON
      repType: DataTypes.INTEGER,
      representativeBankAccounts: DataTypes.JSON, // Assuming array as JSON
      representativeChecks: DataTypes.JSON, // Assuming array as JSON
      representativeNotes: DataTypes.JSON, // Assuming array as JSON
      surnameOrCompanyName: DataTypes.STRING,
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "brokerRepresentative",
      schema: "broker",
      tableName: "brokerRepresentatives",
    },
  );
  return brokerRepresentative;
};
