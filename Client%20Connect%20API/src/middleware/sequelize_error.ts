import { Response, NextFunction } from "express";
import { logger } from "../middleware/logger";
export const sequelizeErrorHandler = (err: Error) => {
  let error = { ...err };
  // error.message = err.message;
  // console.log(error);
  logger.debug(error.name);
  logger.error(JSON.stringify(error));

  const sqlErr = JSON.parse(JSON.stringify(error));

  // catch sequelize errors
  if (["SequelizeDatabaseError"].includes(err.name)) {
    error.message = "Database Error";
  }

  if (["SequelizeUniqueConstraintError"].includes(err.name)) {
    error.message = "Value already exists";
  }

  if (["SequelizeForeignKeyConstraintError"].includes(err.name)) {
    error.message = "Invalid entry for foreigh key";
  }

  if (["SequelizeValidationError"].includes(err.name)) {
    error.message = `Invalid entry for ${sqlErr.errors[0].path}. ${sqlErr.errors[0].message}`;
  }

  if (["AggregateError"].includes(err.name)) {
    // create array of errors
    error.message = "Invalid entry";
    const data = sqlErr.errors.map((err: any) =>
      err.errors.errors.map((err2: any) => err2.message).join(", "),
    );

    return {
      success: false,
      message: error.message || "Unknown error",
      data: data,
    };

    // concat all errors
    // error.message = sqlErr.errors
    //   .map((err: any) => err.errors.errors[0].message)
    //   .join(", ");
    // error.message = `Invalid entry for ${sqlErr.errors[0].errors.errors[0].path}. ${sqlErr.errors[0].errors.errors[0].message}`;
    // console.log(`${sqlErr.errors[0].message}`);
  }

  // console.log(error);

  if (process.env.NODE_ENV === "production") {
    console.log(error);
    return {
      success: false,
      message: error.message || "Unknown error",
    };
  } else {
    return {
      success: false,
      message: error.message || "Unknown error",
      error: error,
    };
  }
};
