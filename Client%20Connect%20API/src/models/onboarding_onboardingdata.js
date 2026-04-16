"use strict";
import moment from "moment";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class onboardingData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ onboardingPolicy, File }) {
      // define association here
      this.belongsTo(onboardingPolicy, {
        foreignKey: "policyId",
        as: "members",
      });
      this.belongsTo(File, {
        foreignKey: "fileId",
      });
    }
  }
  onboardingData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      policyId: {
        type: DataTypes.INTEGER,
      },
      fileId: {
        type: DataTypes.UUID,
      },
      fileRow: {
        type: DataTypes.INTEGER,
      },
      idValid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      dateOfDeath: {
        type: DataTypes.DATEONLY,
        field: "DateOfDeath",
        get: function () {
          return this.getDataValue("dateOfDeath")
            ? moment(this.getDataValue("dateOfDeath")).format(
                "YYYY-MM-DDTHH:mm:ss",
              )
            : null;
        },
      },
      isVopdVerified: {
        type: DataTypes.BOOLEAN,
        field: "VopdVerified",
        defaultValue: false,
      },
      dateVopdVerified: {
        type: DataTypes.DATE,
        field: "VopdVerificationDate",
        defaultValue: null,
        get: function () {
          return this.getDataValue("dateVopdVerified")
            ? moment(this.getDataValue("dateVopdVerified")).format(
                "YYYY-MM-DDTHH:mm:ss",
              )
            : null;
        },
      },
      vopdResponse: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("vopdResponse")
            ? JSON.parse(this.getDataValue("vopdResponse"))
            : null;
        },
        set(value) {
          if (value) {
            this.setDataValue("vopdResponse", JSON.stringify(value));
          }
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "New",
      },
      exceptions: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("exceptions")
            ? JSON.parse(this.getDataValue("exceptions"))
            : null;
        },
        set(value) {
          this.setDataValue("exceptions", JSON.stringify(value));
        },
      },
      client_type: {
        type: DataTypes.TEXT,
        field: "memberType",
      },
      memberTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        required: true,
        validate: {
          isInt: {
            msg: "Not a valid number",
          },
          isIn: {
            args: [[1, 2, 3, 4, 5, 6]],
            msg: "Invalid member type",
          },
        },
      },
      firstName: {
        type: DataTypes.TEXT,
        set(value) {
          if (value) {
            this.setDataValue("firstName", value.toUpperCase().trim());
          }
        },
      },
      surname: {
        type: DataTypes.TEXT,
        set(value) {
          if (value) {
            this.setDataValue("surname", value.toUpperCase().trim());
          }
        },
      },
      mainMemberLinkId: {
        type: DataTypes.TEXT,
      },
      idTypeId: {
        type: DataTypes.INTEGER,
      },
      idNumber: {
        type: DataTypes.TEXT,
        set(value) {
          if (value) {
            this.setDataValue("idNumber", value.toUpperCase().trim());
          }
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        get: function () {
          return this.getDataValue("dateOfBirth")
            ? moment(this.getDataValue("dateOfBirth")).format(
                "YYYY-MM-DDTHH:mm:ss",
              )
            : null;
        },
      },
      statedBenefitId: {
        type: DataTypes.INTEGER,
      },
      statedBenefit: {
        type: DataTypes.TEXT,
      },
      benefitName: {
        type: DataTypes.TEXT,
      },
      joinDate: {
        type: DataTypes.DATEONLY,
      },
      CoverAmount: {
        type: DataTypes.FLOAT,
      },
      premium: {
        type: DataTypes.DECIMAL,
        field: "Premium",
      },
      PreviousInsurer: {
        column: "previousInsurer",
        type: DataTypes.TEXT,
        set(value) {
          if (value) {
            this.setDataValue("PreviousInsurer", value.toUpperCase().trim());
          }
        },
      },
      PreviousInsurerPolicyNumber: {
        column: "previousInsurerPolicyNumber",
        type: DataTypes.TEXT,
        set(value) {
          if (value) {
            this.setDataValue(
              "PreviousInsurerPolicyNumber",
              value.toUpperCase().trim(),
            );
          }
        },
      },
      PreviousInsurerJoinDate: {
        column: "previousInsurerJoinDate",
        type: DataTypes.DATEONLY,
      },
      PreviousInsurerCancellationDate: {
        column: "previousInsurerCancellationDate",
        type: DataTypes.DATEONLY,
      },
      PreviousInsurerCoverAmount: {
        type: DataTypes.FLOAT,
      },
      addressLine1: {
        type: DataTypes.TEXT,
        field: "address1",
        set(value) {
          if (value) {
            this.setDataValue("addressLine1", value.toUpperCase().trim());
          }
        },
      },
      addressLine2: {
        type: DataTypes.TEXT,
        field: "address2",
        set(value) {
          if (value) {
            this.setDataValue("addressLine2", value.toUpperCase().trim());
          }
        },
      },
      city: {
        type: DataTypes.TEXT,
        set(value) {
          if (value) {
            this.setDataValue("city", value.toUpperCase().trim());
          }
        },
      },
      province: {
        type: DataTypes.TEXT,
      },
      country: {
        type: DataTypes.TEXT,
        defaultValue: "SOUTH AFRICA",
      },
      postalCode: {
        type: DataTypes.TEXT,
        field: "areaCode",
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
      postCode: {
        type: DataTypes.TEXT,
        field: "postalCode",
      },
      tellNumber: {
        type: DataTypes.TEXT,
        field: "telephone",
        set(value) {
          if (value) {
            this.setDataValue("tellNumber", String(value).replace(/\s/g, ""));
            if (String(value).startsWith("27") && String(value).length === 11) {
              this.setDataValue("tellNumber", `0${String(value).substring(2)}`);
            }
            if (!String(value).startsWith("0") && String(value).length === 9) {
              // remove 27 from cellNumber
              this.setDataValue("tellNumber", `0${String(value)}`);
            }
          }
        },
        validate: {
          isPhoneNumber(value) {
            if (value) {
              let cellNumber = String(value);
              // trime cellNumber to remove spaces
              cellNumber = cellNumber.replace(/\s/g, "");
              // if cellNumber starts with 27 and is 11 digits long
              if (cellNumber.startsWith("27") && cellNumber.length === 11) {
                // remove 27 from cellNumber
                cellNumber = `0${cellNumber.substring(2)}`;
              }
              if (!cellNumber.startsWith("0") && cellNumber.length === 9) {
                // remove 27 from cellNumber
                cellNumber = `0${cellNumber}`;
              }
              if (!String(value).match(/^0[6-8][0-9]{8}$/)) {
                throw new Error("Mobile phone number must be 10 digits long and start with 06, 07 or 08");
              }
            }
          },
        },
      },
      cellNumber: {
        type: DataTypes.TEXT,
        field: "mobile",
        set(value) {
          if (value) {
            this.setDataValue("cellNumber", String(value).replace(/\s/g, ""));
            if (String(value).startsWith("27") && String(value).length === 11) {
              this.setDataValue("cellNumber", `0${String(value).substring(2)}`);
            }
            if (!String(value).startsWith("0") && String(value).length === 9) {
              // remove 27 from cellNumber
              this.setDataValue("cellNumber", `0${String(value)}`);
            }
          }
        },
        validate: {
          isPhoneNumber(value) {
            if (value) {
              let cellNumber = String(value);
              // trime cellNumber to remove spaces
              cellNumber = cellNumber.replace(/\s/g, "");
              // if cellNumber starts with 27 and is 11 digits long
              if (cellNumber.startsWith("27") && cellNumber.length === 11) {
                // remove 27 from cellNumber
                cellNumber = `0${cellNumber.substring(2)}`;
              }
              if (!cellNumber.startsWith("0") && cellNumber.length === 9) {
                // remove 27 from cellNumber
                cellNumber = `0${cellNumber}`;
              }
              if (!String(value).match(/^0[6-8][0-9]{8}$/)) {
                throw new Error("Mobile phone number must be 10 digits long and start with 06, 07 or 08");
              }
            }
          },
        },
      },
      emailAddress: {
        type: DataTypes.TEXT,
        field: "email",
      },
      preferredCommunicationTypeId: {
        type: DataTypes.TEXT,
        field: "preferredMethodOfCommunication",
      },
      gender: {
        type: DataTypes.INTEGER,
      },
      isStudent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDisabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isBeneficiary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rolePlayerId: {
        type: DataTypes.INTEGER,
      },
      supportDocument: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("supportDocument")
            ? JSON.parse(this.getDataValue("supportDocument"))
            : null;
        },
        set(value) {
          if (value && value !== "") {
            this.setDataValue("supportDocument", JSON.stringify(value));
          }
        },
      },
      notes: {
        type: DataTypes.TEXT,
        get: function () {
          return this.getDataValue("notes")
            ? JSON.parse(this.getDataValue("notes"))
            : null;
        },
        set(value) {
          if (value && value !== "") {
            this.setDataValue("notes", JSON.stringify(value));
          }
        },
      },
      createdBy: {
        type: DataTypes.TEXT,
      },
      updatedBy: {
        type: DataTypes.TEXT,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      alsoMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      schema: "onboarding",
      tableName: "onboardingData",
      paranoid: true,
      deletedAt: "deletedAt",
      hooks: {
        beforeUpdate: async (instance, options) => {
          const payload = {
            before: instance._previousDataValues,
            after: instance.dataValues,
          };
          // compare objects
          const updatedObj = compareObjects(payload.before, payload.after, [
            "idTypeId",
            "idNumber",
            "firstName",
            "surname",
            "dateOfBirth",
            "dateOfDeath",
            "isStudent",
            "isDisabled",
            "tellNumber",
            "cellNumber",
            "emailAddress",
            "supportDocument",
          ]);

          //
          // return;
          // if no changes, return
          // if (Object.keys(updatedObj).length === 0) {
          //   return;
          // }

          // console.log(`member After update ${JSON.stringify(updatedObj)}`);
          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "onboardingData",
            tableId: instance.id,
            changeType: "UPDATE",
            before: payload.before,
            after: payload.after,
            updatedBy: payload.after.updatedBy,
            changedValue: updatedObj,
          };

          // console.log(`History update ${JSON.stringify(historyObj)}`);

          sequelize.models.tableHistory.create(historyObj);
        },
        beforeDestroy: async (instance, options) => {
          const payload = {
            before: instance._previousDataValues,
          };

          // if no changes, return
          // if (Object.keys(updatedObj).length === 0) {
          //   return;
          // }

          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "onboardingData",
            tableId: instance.id,
            changeType: "DELETE",
            before: payload.before,
            updatedBy: instance.updatedBy,
          };

          sequelize.models.tableHistory.create(historyObj);
        },
      },
    },
  );
  return onboardingData;
};
