import { NextFunction, Response, Request } from "express";
import HttpError from "../errors/http-error";
import passport from "../lib/passport-local";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
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
