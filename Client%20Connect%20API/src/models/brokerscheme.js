"use strict";
const { Model } = require("sequelize");
const brokerschemecollectiondetail = require("./scheme_brokerschemecollectiondetail");
module.exports = (sequelize, DataTypes) => {
  class BrokerScheme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      SchemeRoleplayer,
      SchemeCollectionDetail,
      SchemeBankingDetail,
      SchemeDocument,
      SchemeAddress,
      SchemeNote,
    }) {
      // define association here
      this.hasMany(SchemeRoleplayer, {
        foreignKey: "scheme_id",
      });
      this.hasMany(SchemeCollectionDetail, {
        foreignKey: "scheme_id",
      });
      this.hasMany(SchemeBankingDetail, {
        foreignKey: "scheme_id",
      });
      this.hasMany(SchemeDocument, {
        foreignKey: "scheme_id",
      });
      this.hasMany(SchemeAddress, {
        foreignKey: "scheme_id",
      });
      this.hasMany(SchemeNote, {
        foreignKey: "scheme_id",
      });
    }
  }
  BrokerScheme.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      BrokerageId: {
        type: DataTypes.INTEGER,
      },
      RepresentativeId: {
        type: DataTypes.INTEGER,
      },
      ProductOptionID: {
        type: DataTypes.INTEGER,
      },
      RolePlayerId: {
        type: DataTypes.INTEGER,
      },
      DisplayName: {
        type: DataTypes.STRING,
      },
      VatRegistrationNumber: {
        type: DataTypes.STRING,
      },
      ClientTypeID: {
        type: DataTypes.INTEGER,
      },
      CompanyTypeId: {
        type: DataTypes.INTEGER,
      },
      RolePlayerIdentificationTypeId: {
        type: DataTypes.INTEGER,
      },
      IdNumber: {
        type: DataTypes.STRING,
      },
      TellNumber: {
        type: DataTypes.STRING,
      },
      CellNumber: {
        type: DataTypes.STRING,
      },
      EmailAddress: {
        type: DataTypes.STRING,
      },
      JoinDate: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.STRING,
      },
      CreatedBy: {
        type: DataTypes.STRING,
      },
      ApproverId: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "BrokerScheme",
      schema: "schemes",
      tableName: "BrokerSchemes",
    },
  );
  return BrokerScheme;
};
