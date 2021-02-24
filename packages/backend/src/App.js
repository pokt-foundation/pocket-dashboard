import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { errorHandler } from "./apis/_helpers";
import customJwt from "middlewares/jwt";
import sessionRefresh from "middlewares/session-refresh";
import { configureRoutes } from "_routes";

/**
 * @param {object} expressApp Express application object.
 */
export function configureExpress(expressApp) {
  expressApp.use(express.json());
  expressApp.use(
    express.urlencoded({
      extended: false,
    })
  );
  expressApp.use(cookieParser());
  expressApp.use(logger("dev"));
  expressApp.use(
    cors({
      exposedHeaders: ["Authorization"],
    })
  );

  expressApp.use(customJwt());
  expressApp.use(sessionRefresh);
}

/**
 * @param {object} expressApp Express application object.
 */
export function handleErrors(expressApp) {
  expressApp.use(errorHandler);
}

// Initialize express app
const app = express();

configureExpress(app);
configureRoutes(app);

export { app };
