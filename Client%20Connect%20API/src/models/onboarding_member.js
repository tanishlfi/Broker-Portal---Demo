"use strict";
import moment from "moment";
import { SAIDValidator } from "../utils/validator";
const { compareObjects } = require("../utils/compareObjects");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      PolicyMember,
      AstuteResponse,
      AddressDetail,
      Policy,
      BankingDetail,
      PersalDetail,
    }) {
      // define association here
      this.belongsToMany(Policy, {
        through: "PolicyMember",
        foreignKey: "memberId",
        as: "members",
      });
      this.hasMany(PolicyMember, {
        foreignKey: "memberId",
      });
      this.hasOne(PolicyMember, {
        foreignKey: "PolicyHolderMemberId",
        as: "policyholder",
      });

      this.belongsTo(AstuteResponse, {
        foreignKey: "idNumber",
      });
      this.hasMany(AddressDetail, {
        foreignKey: "memberId",
      });
      this.hasOne(BankingDetail, {
        foreignKey: "MemberId",
      });
      this.hasOne(PersalDetail, {
        foreignKey: "MemberId",
      });
    }
  }
  Member.init(
    {
      // column user type string

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        field: "MemberId",
      },
      rolePlayerId: {
        type: DataTypes.INTEGER,
      },
      idTypeId: {
        type: DataTypes.INTEGER,
        // field: "IdTypeId",
        validate: {
          isIn: {
            args: [[1, 2, 4]],
            msg: "Id type must be SA ID or Passport",
          },
        },
        field: "IdType",
      },
      idNumber: {
        type: DataTypes.STRING,
        required: true,
        field: "IdNumber",
        // validate: {
        //   isSAID(value) {
        //     if (this.idTypeId === 1) {
        //       if (!SAIDValidator(value)) {
        //         throw new Error("Invalid SA ID number");
        //       }
        //     }
        //   },
        // },
      },
      firstName: {
        type: DataTypes.STRING,
        field: "FirstName",
        validate: {
          is: /^([^0-9]*)$/,
          // isNull: false,
        },
        set(value) {
          if (value) {
            this.setDataValue("firstName", value.toUpperCase().trim());
          }
        },
      },
      surname: {
        type: DataTypes.STRING,
        field: "Surname",
        validate: {
          is: /^([^0-9]*)$/,
          // isNull: false,
        },
        set(value) {
          if (value) {
            this.setDataValue("surname", value.toUpperCase().trim());
          }
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
          this.setDataValue("vopdResponse", JSON.stringify(value));
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: "DateOfBirth",
        get: function () {
          return this.getDataValue("dateOfBirth")
            ? moment(this.getDataValue("dateOfBirth")).format(
                "YYYY-MM-DDTHH:mm:ss",
              )
            : null;
        },
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
      deathCertificateNumber: {
        type: DataTypes.STRING,
        field: "DeathCertificateNumber",
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
      gender: {
        type: DataTypes.INTEGER,
        field: "GenderId",
      },
      isStudent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "IsStudying",
      },
      isDisabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "IsDisabled",
      },
      supportDocument: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("supportDocument")
            ? JSON.parse(this.getDataValue("supportDocument"))
            : null;
        },
        set(value) {
          this.setDataValue("supportDocument", JSON.stringify(value));
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
          this.setDataValue("notes", JSON.stringify(value));
        },
      },
      preferredCommunicationTypeId: {
        type: DataTypes.INTEGER,
        field: "CommunicationPreferenceId",
      },
      tellNumber: {
        type: DataTypes.STRING,
        field: "TelephoneNumber",
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
        type: DataTypes.STRING,
        field: "MobileNumber",
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
        type: DataTypes.STRING,
        field: "EmailAddress",
      },
      addressTypeId: {
        type: DataTypes.INTEGER,
        field: "AddressTypeId",
      },
      addressLine1: {
        type: DataTypes.STRING,
        field: "AddressLine1",
      },
      addressLine2: {
        type: DataTypes.STRING,
        field: "AddressLine2",
      },
      postalCode: {
        type: DataTypes.STRING(6),
        field: "PostalCode",
      },
      city: {
        type: DataTypes.STRING,
        field: "City",
      },
      province: {
        type: DataTypes.STRING,
        field: "Province",
      },
      countryId: {
        type: DataTypes.INTEGER,
        field: "CountryId",
        defaultValue: 1,
      },
      createdBy: {
        type: DataTypes.STRING,
        field: "CreatedBy",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "CreatedDate",
      },
      updatedBy: {
        type: DataTypes.STRING,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Member",
      tableName: "Member",
      schema: "onboarding",
      // paranoid: true,
      hooks: {
        beforeUpdate: async (instance, options) => {
          const payload = {
            before: instance._previousDataValues,
            after: instance.dataValues,
          };

          // console.log("member pre");
          // console.log(payload);
          // return;
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
          ]);

          //
          // return;
          // if no changes, return
          if (Object.keys(updatedObj).length === 0) {
            return;
          }

          console.log(`member After update ${JSON.stringify(updatedObj)}`);
          // add in schema name, table name and table id and updated by
          const historyObj = {
            schemaName: "onboarding",
            tableName: "Member",
            tableId: instance.id,
            changeType: "UPDATE",
            before: payload.before,
            after: payload.after,
            updatedBy: payload.after.updatedBy,
            changedValue: updatedObj,
          };

          console.log(`History update ${JSON.stringify(historyObj)}`);

          sequelize.models.tableHistory.create(historyObj);
        },
      },
      defaultScope: {
        include: ["AstuteResponse"],
      },
    },
  );
  return Member;
};
