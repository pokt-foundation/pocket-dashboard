import mongoose from "mongoose";
import env, { PersistenceKeys } from "./environment";

const DEV_DB_URL = "mongodb://localhost:27017/gateway-testnet";

function composeMongoUrl(production = false) {
  return production
    ? `mongodb+srv://${(env("PERSISTENCE") as PersistenceKeys).dbUser}:${
        (env("PERSISTENCE") as PersistenceKeys).dbPassword
      }@gateway.kxobp.mongodb.net/${
        (env("PERSISTENCE") as PersistenceKeys).dbName
      }?retryWrites=true&w=majority`
    : `${DEV_DB_URL}`;
}

export const connect = (
  url = composeMongoUrl(env("prod") as boolean),
  opts = {}
): Promise<typeof mongoose> => {
  const userSettings = env("prod")
    ? {
        user: (env("PERSISTENCE") as PersistenceKeys).dbUser,
        pass: (env("PERSISTENCE") as PersistenceKeys).dbPassword,
      }
    : {};

  return mongoose.connect(`${url}`, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ...userSettings,
  });
};
