import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import { errorHandler } from "apis/_helpers";
import customJwt from "middlewares/jwt";
import sessionRefresh from "middlewares/session-refresh";
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
app.use(errorHandler);
app.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);
app.use(customJwt());
app.use(sessionRefresh);
configureRoutes(app);

export { app };
