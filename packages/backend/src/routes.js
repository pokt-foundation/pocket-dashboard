import Index from "apis/IndexApi";
import User from "apis/UserApi";
import Account from "apis/AccountApi";
import SecurityQuestion from "apis/SecurityQuestionApi";
import Application from "apis/ApplicationApi";
import Node from "apis/NodeApi";
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

  // Security Questions API
  expressApp.use("/api/security_questions", SecurityQuestion);

  // Applications API
  expressApp.use("/api/applications", Application);

  // Nodes API
  expressApp.use("/api/nodes", Node);

  // Network API
  expressApp.use("/api/network", Network);
}
