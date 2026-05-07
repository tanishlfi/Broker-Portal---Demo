import { Response, NextFunction } from "express";
import { logger } from "../middleware/logger";
export const sequelizeErrorHandler = (err: any) => {
  const error = { ...err };
  logger.debug(`Database Error Type: ${err.name}`);
  logger.error(`Error Details: ${JSON.stringify(err)}`);

  let message = "An unexpected database error occurred";
  let statusCode = 400;

  if (err.name === "SequelizeDatabaseError") {
    message = "Database Error: " + (err.parent?.message || err.message);
  } else if (err.name === "SequelizeUniqueConstraintError") {
    message = "A record with this information already exists.";
    statusCode = 409;
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    message = "Linked record not found. Please check your IDs (e.g., Lead ID, Broker ID).";
  } else if (err.name === "SequelizeValidationError") {
    message = err.errors.map((e: any) => e.message).join(", ");
  } else if (err.name === "ValidationError" && err.inner) {
    // Yup Validation Error
    message = "Validation failed: " + err.inner.map((e: any) => `${e.path}: ${e.message}`).join("; ");
    statusCode = 400;
  } else if (err.name === "AggregateError") {
    message = "Multiple validation errors occurred.";
  } else if (err.message) {
    message = err.message;
  }

  return {
    success: false,
    message: message,
    error_code: err.name || "INTERNAL_ERROR",
    ...(process.env.NODE_ENV !== "production" && { details: err })
  };
};
