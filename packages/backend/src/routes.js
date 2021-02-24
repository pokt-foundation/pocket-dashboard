import Index from "apis/IndexApi";
import User from "apis/UserApi";
import Account from "apis/AccountApi";
import Application from "apis/ApplicationApi";
import Network from "apis/NetworkApi";

/**
 * @param {object} expressApp Express application object.
 */
export function configureRoutes(expressApp) {
  // Index API
  expressApp.use("/", Index);

  // Users API
  expressApp.use("/api/users", User);

  // Account API
  expressApp.use("/api/accounts", Account);

  // Applications API
  expressApp.use("/api/applications", Application);

  // Network API
  expressApp.use("/api/network", Network);
}
