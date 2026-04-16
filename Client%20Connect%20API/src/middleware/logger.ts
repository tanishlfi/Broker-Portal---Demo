import * as winston from "winston";
const WinstonTransportSequelize = require("winston-transport-sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const Sequelize = require("sequelize");
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

const options = {
  sequelize: sequelize, // sequelize instance [required]
  tableName: "logs", // default name
  meta: { project: "rma" }, // meta object defaults
  fields: { meta: Sequelize.JSONB }, // merge model fields
  modelOptions: { timestamps: true }, // merge model options
  level: process.env.LOGLEVEL || "info", // level of messages to log
};

export const logger = winston.createLogger({
  transports: [
    new WinstonTransportSequelize(options),
    new winston.transports.Console({
      level: options.level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
