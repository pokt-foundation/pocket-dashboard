import jwt from "express-jwt";
import env from "environment";
import { excludedPaths } from "excluded-paths";

/**
 * Custom middleware for JWT setup.
 *
 * @returns {object} JWT config.
 */
export default function customJwt() {
  return jwt({
    secret: env("auth").secret_key,
    algorithms: ["HS256"],
    getToken: function fromHeader(req) {
      if (req.headers.authorization) {
        let accessToken;

        if (
          req.headers.authorization.split(", ")[0].split(" ")[0] === "Token"
        ) {
          accessToken = req.headers.authorization.split(", ")[0].split(" ")[1];
        }

        return accessToken;
      }

      return null;
    },
  }).unless({
    path: excludedPaths,
  });
}
