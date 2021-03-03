import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import asyncMiddleware from "middlewares/async";
import Token, { TOKEN_TYPES } from "models/Token";
import User from "models/User";
import HttpError from "errors/http-error";
import passport from "lib/passport-local";

const DEFAULT_PROVIDER = "EMAIL";
const SALT_ROUNDS = 10;
const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

const router = express.Router();

function createCookieFromToken(user, statusCode, req, res) {
  const token = user.generateVerificationToken();

  const cookieOptions = {
    // Expires in 10 days
    expires: new Date(Date.now() + TEN_DAYS),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

/**
 * User authentication using username and password.
 */
router.post(
  "/login",
  asyncMiddleware(async (req, res, next) => {
    passport.authenticate(
      "login",
      // As we're using an API which requires a token for each request,
      // we don't need to save a session in the server
      { session: false },
      async (err, user) => {
        if (err) {
          throw HttpError.BAD_REQUEST(err);
        }

        if (!user) {
          throw HttpError.BAD_REQUEST({
            status: "error",
            meessage: "Incorrect email or password",
          });
        }
        createCookieFromToken(user, 200, req, res);
      }
    )(req, res, next);
  })
);

/**
 * User sign up using email.
 */
router.post(
  "/signup",
  asyncMiddleware(async (req, res, next) => {
    passport.authenticate("signup", { session: false }, async (err, user) => {
      console.log("alo");
      if (err) {
        throw HttpError.BAD_REQUEST(err);
      }

      if (!user) {
        throw HttpError.BAD_REQUEST({
          status: "error",
          meessage: "Incorrect email or password",
        });
      }
      createCookieFromToken(user, 200, req, res);
    })(req, res, next);
  })
);

/**
 * Validate captcha token
 */
router.post(
  "/verify-captcha",
  asyncMiddleware(async (req, res) => {
    /** @type {{token:string}} */
    const { token } = req.body;
    const result = await User.verifyCaptcha(token);

    res.json(result.data);
  })
);

/**
 * Send signup email
 */
router.post(
  "/send-signup-email",
  asyncMiddleware(async (req, res) => {
    const { email, validationRoute } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError.BAD_REQUEST({ message: "User does not exist" });
    }

    // TODO: First check if there's an active token, and delete it
    const staleToken = await Token.findOne({ userId: user._id });

    if (staleToken) {
      await staleToken.deleteOne();
    }
    // TODO: Make validation token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

    const userResetToken = new Token({
      userId: user._id,
      token: hashedResetToken,
      type: TOKEN_TYPES.verification,
      createdAt: Date.now(),
    });

    await userResetToken.save();

    const validationLink = `${validationRoute}/?token=${resetToken}&email=${email}`;
    // TODO: Send email with link

    return res.status(204).send();
  })
);

router.post(
  "/send-reset-email",
  asyncMiddleware(async (req, res) => {
    const { email, resetRoute } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError.BAD_REQUEST({ message: "User does not exist" });
    }

    // TODO: First check if there's an active token, and delete it
    const staleToken = await Token.findOne({ userId: user._id });

    if (staleToken) {
      await staleToken.deleteOne();
    }
    // TODO: Make validation token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

    const userResetToken = new Token({
      userId: user._id,
      token: hashedResetToken,
      type: TOKEN_TYPES.reset,
      createdAt: Date.now(),
    });

    await userResetToken.save();

    const resetLink = `${resetRoute}/?token=${resetToken}&email=${email}`;
    // TODO: Send email with link

    return res.status(204).send();
  })
);

router.post(
  "/reset-password",
  asyncMiddleware(async (req, res) => {
    const { plainToken, password1, password2, email } = req.body;

    if (!plainToken || !password1 || !password2 || !email) {
      throw HttpError.BAD_REQUEST({
        message: "Missing required fields in body",
      });
    }

    const isPasswordValid = await User.validatePassword(password1);

    if (!isPasswordValid) {
      throw HttpError.BAD_REQUEST({ message: "Password is not secure enough" });
    }

    if (password1 !== password2) {
      throw HttpError.BAD_REQUEST({ message: "Passwords don't match" });
    }

    const storedToken = await Token.findOne({
      email,
      type: TOKEN_TYPES.TOKEN_RESET,
    });

    if (!storedToken) {
      throw HttpError.BAD_REQUEST({ message: "Token is not valid" });
    }

    const isTokenMatching = await bcrypt.compare(plainToken, storedToken);

    if (!isTokenMatching) {
      throw HttpError.BAD_REQUEST({ message: "Token is not matching" });
    }

    const newHashedPassword = await bcrypt.hash(password1, SALT_ROUNDS);

    await User.updateOne(
      {
        email,
      },
      { $set: { password: newHashedPassword } },
      { new: true }
    );

    await storedToken.deleteOne();

    res.status(204).send();
  })
);

router.post(
  "/validate-user",
  asyncMiddleware(async (req, res) => {
    const { plainToken, email } = req.body;

    if (!plainToken || !email) {
      throw HttpError.BAD_REQUEST({
        message: "Missing required fields in body",
      });
    }

    const storedToken = await Token.findOne({
      email,
      type: TOKEN_TYPES.TOKEN_VERIFICATION,
    });

    if (!storedToken) {
      throw HttpError.BAD_REQUEST({ message: "Token is not valid" });
    }

    const isTokenMatching = await bcrypt.compare(plainToken, storedToken);

    if (!isTokenMatching) {
      throw HttpError.BAD_REQUEST({ message: "Token is not matching" });
    }

    await User.updateOne(
      {
        email,
      },
      { $set: { verified: true } },
      { new: true }
    );

    await storedToken.deleteOne();

    res.status(204).send();
  })
);

export default router;
