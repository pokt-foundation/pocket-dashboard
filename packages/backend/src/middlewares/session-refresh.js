import { DashboardValidationError } from "models/Exceptions";
import UserService from "services/UserService";
import { excludedPaths } from "excluded-paths";

// TODO: Refactor middleware
export default async function (err, req, res, next) {
  const userService = new UserService();

  try {
    // Try to renew the session if expired
    if (err.message === "jwt expired") {
      console.log("alo2");
      // Try to get new session tokens using the refresh token
      if (
        req.headers.authorization.split(", ")[1].split(" ")[0] === "Refresh" &&
        req.headers.authorization.split(", ")[2].split(" ")[0] === "Email"
      ) {
        const refreshToken = req.headers.authorization
          .split(", ")[1]
          .split(" ")[1];
        const userEmail = req.headers.authorization
          .split(", ")[2]
          .split(" ")[1];

        if (refreshToken && userEmail) {
          const newSessionTokens = await userService.renewSessionTokens(
            refreshToken,
            userEmail
          );

          if (newSessionTokens instanceof DashboardValidationError) {
            throw newSessionTokens;
          }

          // Update the auth headers with the new tokens
          res.set(
            "Authorization",
            `Token ${newSessionTokens.accessToken}, Refresh ${newSessionTokens.refreshToken}, Email ${userEmail}`
          );
        }
      } else {
        res.status(401).send("Token expired, please sign in again.");
      }
    }

    // Check if the request contains an email, meaning a change or private data is being requested
    if (req.body && req.body.email && !excludedPaths.includes(req.path)) {
      if (
        !(await userService.verifySessionForClient(
          req.headers.authorization,
          req.body.email
        ))
      ) {
        res.send({
          success: false,
          data: "Account doesn't belong to the client.",
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
  next();
}
