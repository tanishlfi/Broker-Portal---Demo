"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SchemeRoleplayer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ BrokerScheme }) {
      // define association here
      this.belongsTo(BrokerScheme, {
        foreignKey: "scheme_id",
      });
    }
  }
  SchemeRoleplayer.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      scheme_id: {
        type: DataTypes.UUID,
      },
      ReferenceNo: {
        type: DataTypes.STRING,
      },
      ExpiryDate: {
        type: DataTypes.DATE,
      },
      GeneratedDate: {
        type: DataTypes.DATE,
      },
      Lives: {
        type: DataTypes.INTEGER,
      },
      Premium: {
        type: DataTypes.FLOAT,
      },
      status: {
        type: DataTypes.STRING,
      },
      CommissionFee: {
        type: DataTypes.FLOAT,
      },
      ServiceFee: {
        type: DataTypes.FLOAT,
      },
      BinderFee: {
        type: DataTypes.FLOAT,
      },
      document: {
        type: DataTypes.STRING(4000),
        get: function () {
          return this.getDataValue("document")
            ? JSON.parse(this.getDataValue("document"))
            : null;
        },
        set(value) {
          this.setDataValue("document", JSON.stringify(value));
        },
      },
      PayDate: {
        type: DataTypes.DATE,
      },
      PaymentMethod: {
        type: DataTypes.STRING,
      },
      PaymentFrequency: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "SchemeRoleplayer",
      schema: "schemes",
      tableName: "SchemeRoleplayers",
    },
  );
  return SchemeRoleplayer;
};
