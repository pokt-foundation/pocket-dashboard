import passport from "passport";
import { Strategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import User from "models/User";
import env from "environment";

const AUTH_FIELDS = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
};

const JWT_OPTIONS = {
  secretOrKey: env("auth").public_secret,
  algorithms: ["RS256"],
  passReqToCallback: true,
};

function extractTokenFromCookie(req) {
  return req?.cookies?.jwt ?? null;
}

JWT_OPTIONS.jwtFromRequest = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  (req) => extractTokenFromCookie(req),
]);

passport.use(
  "login",
  new Strategy(AUTH_FIELDS, async (req, email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done({ message: "Incorrect email or password" }, null);
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return done({ message: "Incorreect email or password" }, null);
      }

      return done(null, user);
    } catch (err) {
      // TODO: Log error to sentry and with a logger
      return done({ statusCode: 400, message: err.message });
    }
  })
);

passport.use(
  "signup",
  new Strategy(AUTH_FIELDS, async (req, email, password, done) => {
    try {
      const emailRegistered = await User.findOne({ email });

      if (emailRegistered) {
        return done({ statusCode: 400, message: "Email already in use" }, null);
      }

      const isPasswordSecure = await User.validatePassword(password);

      if (!isPasswordSecure) {
        return done(
          { statusCode: 400, message: "Password not strong enough" },
          null
        );
      }

      const encryptedPassword = await User.encryptPassword(password);

      const user = new User({
        email,
        username: email,
        password: encryptedPassword,
        validated: false,
        v2: true,
      });

      await user.save();

      return done(null, user);
    } catch (err) {
      return done({ statusCode: 400, message: err.message });
    }
  })
);

passport.use(
  new JwtStrategy(JWT_OPTIONS, (req, jwtPayload, done) => {
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
