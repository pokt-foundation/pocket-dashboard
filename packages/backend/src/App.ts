import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import { errorHandler } from "./helpers/utils";
import notFoundMiddleware from "./middlewares/not-found";
import { configureRoutes } from "./routes";
import { connect } from "./db";

const PORT = process.env.PORT || 4200;

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
    origin: [
      "https://dashboard.pokt.network",
      "https://mainnet.dashboard.pokt.network",
      "https://testnet.dashboard.pokt.network",
      "http://localhost:3000",
    ],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

passport.initialize();

configureRoutes(app);
app.use(notFoundMiddleware());
app.use(errorHandler(app));

export const startServer = async (): Promise<void> => {
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
