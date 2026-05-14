import { Request, Response, NextFunction } from "express";
// import { InvalidTokenError } from "express-oauth2-jwt-bearer";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = { ...err, statusCode: 500 };
  error.message = err.message;
  // console.log(err.name);

  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  // If it's an unauthorized or auth error
  if (err.name === "UnauthorizedError" || err.message.includes("audiences") || err.message.includes("authorized")) {
    return res.status(401).json({
      success: false,
      message: err.message || "User not authorized, please login again",
    });
  }

  const status = (err as any).status || (err as any).statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
