import mongoose from "mongoose";
import env from "environment";

const DEV_DB_URL = "mongodb://localhost:27017/gateway-testnet";

function composeMongoUrl(production = false) {
  return production
    ? `mongodb+srv://${env("persistence").default.db_user}:${
        env("persistence").default.db_password
      }@gateway.kxobp.mongodb.net/${
        env("persistence").default.db_name
      }?retryWrites=true&w=majority`
    : `${DEV_DB_URL}`;
}

export const connect = (url = composeMongoUrl(env("prod")), opts = {}) => {
  const userSettings = env("prod")
    ? {
        user: env("persistence").default.db_user,
        pass: env("persistence").default.db_password,
      }
    : {};

  return mongoose.connect(`${url}`, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ...userSettings,
  });
};
