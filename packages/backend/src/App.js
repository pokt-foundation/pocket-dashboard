import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import { errorHandler } from "helpers/utils";
import notFoundMiddleware from "middlewares/not-found";
import { configureRoutes } from "routes";
import { connect } from "db";

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

// app.use(customJwtMiddleware());

passport.initialize();

configureRoutes(app);
app.use(notFoundMiddleware());
app.use(errorHandler);

const PORT = process.env.PORT || 4200;

export const startServer = async () => {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(`App listening to ${PORT}....`);
      console.log("Press Ctrl+C to quit.");
    });
  } catch (err) {
    console.error(err);
    // TODO: Log error to sentry
  }
};
