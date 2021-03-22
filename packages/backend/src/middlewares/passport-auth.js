import HttpError from "errors/http-error";
import passport from "lib/passport-local";

export const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(
        HttpError.UNAUTHORIZED({
          errors: [{ id: "UNAUTHORIZED", message: "Unauthorized" }],
        })
      );
    }

    if (!user) {
      return next(
        HttpError.UNAUTHORIZED({
          errors: [{ id: "UNAUTHORIZED", message: "Unauthorized" }],
        })
      );
    }

    req.user = user;
    return next();
  })(req, res, next);
};
