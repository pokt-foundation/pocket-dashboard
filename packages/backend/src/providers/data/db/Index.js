import MongoDBAdapter from "./MongoDBAdapter";
import env from "environment";

const DEFAULT_DB_PROVIDER = new MongoDBAdapter(env("persistence").default);

/**
 * @returns {MongoDBAdapter} The default mongo adapter provider.
 */
export function get_default_db_provider() {
  return DEFAULT_DB_PROVIDER;
}
