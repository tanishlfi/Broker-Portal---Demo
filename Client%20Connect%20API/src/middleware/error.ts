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

  // if (err instanceof InvalidTokenError) {
  //   return res.status(401).json({
  //     success: false,
  //     message: "User not authorized please login again",
  //   });
  // }
};
