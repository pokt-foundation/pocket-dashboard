import { Request } from "express";
import passport from "passport";
import { IStrategyOptionsWithRequest, Strategy } from "passport-local";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions as JwtOptions,
} from "passport-jwt";
import User, { IUser } from "../models/User";
import env, { AuthKeys } from "../environment";
import HttpError from "../errors/http-error";

function extractTokenFromCookie(req: Request) {
  return req?.cookies?.jwt ?? null;
}

const AUTH_FIELDS: IStrategyOptionsWithRequest = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
};

const JWT_OPTIONS: JwtOptions = {
  secretOrKey: (env("AUTH") as AuthKeys).publicSecret,
  algorithms: ["RS256"],
  passReqToCallback: true,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req) => extractTokenFromCookie(req),
  ]),
};

passport.use(
  "login",
  new Strategy(
    AUTH_FIELDS,
    async (_: Request, email: string, password: string, done) => {
      try {
        const user: IUser = await User.findOne({ email });

        if (!user) {
          return done(
            HttpError.BAD_REQUEST({
              errors: [
                {
                  id: "WRONG_EMAIL_OR_PASSWORD",
                  message: "Incorrect email or password",
                },
              ],
            }),
            null
          );
        }
        if (!user.v2) {
          return done(
            HttpError.BAD_REQUEST({
              errors: [
                {
                  id: "OUTDATED_USER",
                  message:
                    "Your user has not been migrated to use the new dashboard.",
                },
              ],
            }),
            null
          );
        }

        const isPasswordValid = user.comparePassword(password, user.password);

        if (!isPasswordValid) {
          return done(
            HttpError.BAD_REQUEST({
              errors: [
                {
                  id: "WRONG_EMAIL_OR_PASSWORD",
                  message: "Incorrect email or password",
                },
              ],
            }),
            null
          );
        }
        return done(null, user);
      } catch (err) {
        // TODO: Log error to sentry and with a logger
        return done({ status: 400, message: err.message });
      }
    }
  )
);

passport.use(
  "signup",
  new Strategy(
    AUTH_FIELDS,
    async (_: Request, email: string, password: string, done) => {
      try {
        const processedEmail = email;
        const emailRegistered = await User.findOne({ email: processedEmail });

        if (emailRegistered) {
          return done(
            HttpError.BAD_REQUEST({
              errors: [{ id: "BAD_EMAIL", message: "Email already in use" }],
            }),
            null
          );
        }

        // @ts-ignore
        const isPasswordSecure = await User.validatePassword(password);

        if (!isPasswordSecure) {
          return done(
            HttpError.BAD_REQUEST({
              errors: [
                { id: "BAD_PASSWORD", message: "Password's not strong enough" },
              ],
            }),
            null
          );
        }

        // @ts-ignore
        const encryptedPassword = await User.encryptPassword(password);

        const user = new User({
          email: processedEmail,
          username: processedEmail,
          password: encryptedPassword,
          validated: false,
          v2: true,
        });

        await user.save();
        return done(null, user);
      } catch (err) {
        console.log(err);
        return done({ statusCode: 400, message: err.message });
      }
    }
  )
);

passport.use(
  new JwtStrategy(JWT_OPTIONS, (_: Request, jwtPayload, done) => {
    User.findOne({ _id: jwtPayload.id })
      .then((user) => {
        if (!user) {
          done(null, false);
        } else {
          done(null, user);
        }
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);
export default passport;
