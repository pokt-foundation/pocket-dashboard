import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import { errorHandler } from "apis/_helpers";
import customJwtMiddleware from "middlewares/jwt";
import notFoundMiddleware from "middlewares/not-found";
import sessionRefreshMiddleware from "middlewares/session-refresh";
import { configureRoutes } from "routes";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);
app.use(customJwtMiddleware());
app.use(sessionRefreshMiddleware);
app.use(notFoundMiddleware);
app.use(errorHandler);

configureRoutes(app);

export { app };
