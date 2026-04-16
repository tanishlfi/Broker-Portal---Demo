"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
// const sequelizeHistory = require("sequelize-history");
// const trackAll = require("sequelize-history").all;
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// sequelizeHistory.DEFAULTS = {
//   // String to indicate a field name to use to store the
//   // author of the revisions to the model, or null if you
//   // don't want to track revision authors
//   authorFieldName: null,
//   // String to append to tracked model's name in creating
//   // name of model's history model
//   modelSuffix: "History",
//   // Array of attributes to be ignored and excluded when
//   // recording a change to the target model
//   excludedAttributes: [],
//   // Array of attribute properties to ignore when duplicating
//   // the target model's attributes - this is mostly to prevent
//   // the use of constraints that may be in place on the target
//   excludedAttributeProperties: [
//     "Model",
//     "unique",
//     "primaryKey",
//     "references",
//     "onUpdate",
//     "onDelete",
//     "autoIncrement",
//     "set",
//     "get",
//     "_modelAttribute",
//     "allowNull",
//   ],
// };

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;

    // if (model.name === "Policy") {
    //   sequelizeHistory(model, sequelize);
    // }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
