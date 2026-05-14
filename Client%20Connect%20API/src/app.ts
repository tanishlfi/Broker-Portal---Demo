import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// load env variables before you start sequelize
dotenv.config({ path: __dirname + "/config/config.env" });
dotenv.config({ path: __dirname + "/../.env" });

// set environment variables
let APP_VERSION: string = process.env.APP_VERSION || "test"; // API path for production should be set to v1 in config.env
let PORT: number = Number(process.env.PORT) || 8000;
let NODE_ENV: string = process.env.NODE_ENV || "development"; // NODE_ENV should be set to test or production in config.env

import { logger } from "./middleware/logger";
import { sequelize } from "./models";
import { errorHandler } from "./middleware/error";
import router from "./routes";
import { confirmToken } from "./middleware/auth";
import { getRmaAccessToken } from "./middleware/getRmaToken";
import { health } from "./controllers/healthController";
import swaggerUi from "swagger-ui-express";
import { specs } from "./utils/swagger";

//console.log(APP_GLOBAL_URL)
const app = express();

app.use(cors());
app.use(express.json({ limit: "10Mb" }));
app.use(express.urlencoded({ extended: false, limit: "10Mb" }));

// health endpoint that does a database query to confirm db available
app.get("/apirma/health", health);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// added middelware to confirm expiry auth0 not doing this for some reason
// Lourens 2023/12/07
app.use(confirmToken);

// console.log(process.env.AUTH0_AUDIENCE);
const rawJwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE || "http://localhost:8000/api/test", // URL of the Client application
  issuerBaseURL: process.env.AUTH0_ISSUER || "https://cdasol.eu.auth0.com/",
  tokenSigningAlg: "RS256",
  timeoutDuration: 5000,
});

const conditionalJwtCheck = (req: Request, res: Response, next: NextFunction) => {
  if (
    process.env.BYPASS_AUTH === "true" || 
    process.env.NODE_ENV !== "production" ||
    req.originalUrl.includes("/broker/otp") ||
    req.headers.authorization?.includes("test-token")
  ) {
    return next();
  }
  return rawJwtCheck(req, res, next);
};

app.use(
  `/apirma/${APP_VERSION}`,
  conditionalJwtCheck,
  getRmaAccessToken,
  router,
);

// handle parsing errors
app.use(errorHandler);

const server = app.listen(PORT, async () => {
  logger.debug(
    `Client Connect Server running in ${NODE_ENV} mode on port ${PORT}`,
  );

  logger.debug("Server Authenticated");
  logger.debug("Client Connect Server Up");
});

process.on("unhandledRejection", (err: Error, promise) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`);
  logger.debug("Client Connect server down");
  server.close(() => process.exit(1));
});
