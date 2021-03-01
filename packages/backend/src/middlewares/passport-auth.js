import passport from "lib/passport-local";

export const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      throw new Error({
        statusCode: 400,
        message: "Invalid token",
      });
    }

    req.user = user;
    // DEBUG(user.userName);
    return next();
  })(req, res, next);
};
